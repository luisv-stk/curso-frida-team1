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

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocal3000", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("AllowLocal3000");

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

    var inputText = @$"You are an expert image analyst. Analyze the image, giving the results in Spanish.\nOutput: concise JSON only (no markdown), with fields:\nname: A descriptive name for the image based on its content.\nformat: One of the following: \""image\"", \""video\"", \""illustration\"", or \""3D\"".\ntags: A list of relevant tags or keywords describing the image.\nauthor: Extracted from the image metadata, if available.\ndate: Original creation date from metadata.\nupload_date: Upload date from metadata, if available.\n\nReturn only the JSON object, without additional commentary.\n<expected_output>\n{{\n  \""name\"": \""Sunsetovermountainrange\"",\n  \""format\"": \""image\"",\n  \""tags\"": [\""sunset\"", \""mountains\"", \""landscape\"", \""nature\""],\n  \""author\"": \""JohnDoe\"",\n  \""date\"": \""2023-06-15\"",\n  \""upload_date\"": \""2023-07-01\""\n}}\n</expected_output>\n\nSchema: {{ \""name\"": string | null, \""format\"": \""image\"" | \""video\"" | \""illustration\"" | \""3D\"" | null, \""tags\"": [string], \""author\"": string | null, \""date\"": string | null, \""upload_date\"": string | null, \""uncertain\"": bool }}";

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
                    },
                    new ContentItem
                    {
                        Type = "image_url",
                        ImageUrl = new ImageUrlContent
                        {
                            Url = "data:image/jpeg;base64," + body.Base64Image,
                            Detail = "Analyze this image and provide a concise JSON description as specified."
                        }
                    }
                }
            }
        },
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