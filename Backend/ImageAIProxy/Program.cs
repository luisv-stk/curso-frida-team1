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

//builder.Services.AddHttpClient();

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

    var inputText = @$"You are a precise visual analyst. Analyze the image between <image_b64>...</image_b64>.
        Output: concise JSON only (no markdown), with fields: summary, insights[], issues[], confidence_overall (0..1).
        Rules: Do not echo or include the base64 content in the output.

        <image_b64>
        {body.Base64Image}
        </image_b64>";

    var payload = new ModelRequest
    {
        Model = "Innovation-gpt4o",
        Input = inputText,
        Temperature = 0,    // análisis estable; si prefieres variación, sube a 0.2–0.3 y cambia a double
        MaxTokens = 4000,   // suficiente para respuesta estructurada
        TopP = 1,           // mantenlo en 1 (no mezclar mucho con temperature)
        Stream = false,
        Tools = null,
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