using ImageAIProxy;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Routing.Constraints;

var builder = WebApplication.CreateSlimBuilder(args);

// Configure AOT serializer context
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddRouting(options =>
{
    options.SetParameterPolicy<RegexInlineRouteConstraint>("regex");
});

builder.WebHost.UseKestrelHttpsConfiguration();
builder.Services.AddHttpClient();
var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


/*
 * Processes an image, sending its base64 representation to an external AI service for analysis.
 */

app.MapPost("/process-image", async (
    ImageRequest? body,
    IHttpClientFactory httpFactory,
    CancellationToken ct) =>
{
    if (body is null || string.IsNullOrEmpty(body.Base64Image))
        return Results.BadRequest(new { error = "Debe enviarse una imagen codificada en Base64" });

    var inputText = @$"You are an expert image analyst. Analyze the image between <image_b64>...</image_b64>.
        Output: concise JSON only (no markdown), with fields: name: A descriptive name for the image based on its content.\r\nformat: One of the following: \""image\"", \""video\"", \""illustration\"", or \""3D\"".\r\ntags: A list of relevant tags or keywords describing the image.\r\nsize: Dimensions of the image in pixels, as {{ \""width\"": ..., \""height\"": ... }}.\r\nauthor: Extracted from the image metadata, if available.\r\ndate: Original creation date from metadata.\r\nupload_date: Upload date from metadata, if available.\r\n\r\n\r\nReturn only the JSON object, without additional commentary.\r\n<expected_output>\r\n{{\r\n  \""name\"": \""Sunset over mountain range\"",\r\n  \""format\"": \""image\"",\r\n  \""tags\"": [\""sunset\"", \""mountains\"", \""landscape\"", \""nature\""],\r\n  \""size\"": {{\r\n    \""width\"": 1920,\r\n    \""height\"": 1080\r\n  }},\r\n  \""author\"": \""John Doe\"",\r\n  \""date\"": \""2023-06-15\"",\r\n  \""upload_date\"": \""2023-07-01\""\r\n}}\r\n<\/expected_output>
        Schema: {{ ""name"": string | null, ""format"": ""image"" | ""video"" | ""illustration"" | ""3D"" | null, ""tags"": [string], ""size"": {{ ""width"": int | null, ""height"": int | null }}, ""author"": string | null, ""date"": string | null, ""upload_date"": string | null, ""uncertain"": bool }}

        <image_b64>
        {body.Base64Image}
        </image_b64>";

    var payload = new ModelRequest
    {
        Model = "claude-4-sonnet",
        Messages = new List<RequestMessage>
        {
            new RequestMessage
            {
                Role = "user",
                Content = new List<ContentItem>
                {
                    new ContentItem
                    {
                        Type = "text",
                        Text = inputText
                    }
                }
            }
        },
        //Input = inputText,
        //Temperature = 0.2,    // análisis estable; si prefieres variación, sube a 0.2–0.3 y cambia a double
        //MaxTokens = 1500,   // suficiente para respuesta estructurada
        //TopP = 1,           // mantenlo en 1 (no mezclar mucho con temperature)
        Stream = false,
        EnableCaching = false
    };

    try
    {
        var http = httpFactory.CreateClient();

        using var response = await FridaLlmApiClient.AnalyzeAsync(
                    http,
                    payload,
                    AppJsonSerializerContext.Default.ModelRequest);


        var responseBody = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            // Devuelve el detalle para diagnóstico
            return Results.Problem(
                title: "Error llamando a la IA externa",
                detail: responseBody,
                statusCode: (int)response.StatusCode);
        }

        // Parse formato estilo OpenAI (choices[0].message.content)
        var completion = JsonSerializer.Deserialize(
            responseBody,
            AppJsonSerializerContext.Default.CompletionResponse);

        var message = completion?.choices is { Length: > 0 }
            ? completion.choices[0]?.message?.content
            : null;

        if (string.IsNullOrWhiteSpace(message))
            return Results.Problem("La respuesta de la IA externa no se pudo analizar");

        return Results.Ok(new AnalyzeResponse(message));
    }
    catch (Exception)
    {
        // TODO: log ex
        return Results.Problem("Error inesperado al contactar la IA externa");
    }

});

app.Run();

/// <summary>
/// Represents an image request containing a Base64 encoded image.
/// </summary>
public record ImageRequest(string Base64Image);

/// <summary>
/// Payload sent to external AI analyzer.
/// </summary>
public record AnalyzeRequest(string prompt, string image_base64);

/// <summary>
/// Result from the external AI analyzer.
/// </summary>
public record AnalyzeResponse(string AnalysisResult);

[JsonSourceGenerationOptions(GenerationMode = JsonSourceGenerationMode.Default, PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
[JsonSerializable(typeof(ImageRequest))]
[JsonSerializable(typeof(AnalyzeRequest))]
[JsonSerializable(typeof(AnalyzeResponse))]
[JsonSerializable(typeof(ModelRequest))]
[JsonSerializable(typeof(CompletionResponse))]
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}