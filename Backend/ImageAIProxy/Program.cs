using System.Text.Json.Serialization;

var builder = WebApplication.CreateSlimBuilder(args);

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonSerializerContext.Default);
});

var app = builder.Build();

app.MapPost("/process-image", async (HttpRequest request) =>
{
    var body = await request.ReadFromJsonAsync<ImageRequest>();
    if (body?.Base64Image is null)
        return Results.BadRequest("Debe enviarse una imagen codificada en Base64");

    using var http = new HttpClient();

    var payload = new
    {
        prompt = "Analiza esta imagen",
        image_base64 = body.Base64Image
    };

    var response = await http.PostAsJsonAsync("https://api.externa-ia.com/analyze", payload);

    if (!response.IsSuccessStatusCode)
        return Results.Problem("Error llamando a la IA externa");

    var result = await response.Content.ReadAsStringAsync();
    return Results.Ok(result);
});

app.Run();

// === Modelos ===
public record ImageRequest(string Base64Image);

// === Contexto JSON para AOT ===
[JsonSerializable(typeof(ImageRequest))]
[JsonSerializable(typeof(string))] // para respuestas simples
internal partial class AppJsonSerializerContext : JsonSerializerContext
{
}
