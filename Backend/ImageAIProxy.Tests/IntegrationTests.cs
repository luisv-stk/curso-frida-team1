using System.Net.Http.Json;
using System.Text.Json;

namespace ImageAIProxy.Tests;

/// <summary>
/// Integration tests for /chat/completions.
/// </summary>
public class IntegrationTests
{
    private readonly HttpClient _client = new HttpClient { BaseAddress = new Uri("https://frida-llm-api.azurewebsites.net") };
    private const string _bearerToken = "vizeE6PMyaLY94NosV3J";

    [Fact]
    public async Task ProcessImage_Endpoint_AnalyzesImageRealApi()
    {
        // Add Bearer authentication header
        _client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _bearerToken);

        // Use a small test PNG image encoded in base64.
        const string base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAUA" +
                              "AAAFCAYAAACNbyblAAAAHElEQVQI12P4" +
                              "//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

        // Build the payload matching the required JSON structure.
        var payload = new ModelRequest
        {
            Model = "claude-4-sonnet",
            Input = $"Analyze the following image encoded in base64:{base64Image}",
            Temperature = 1,
            MaxTokens = 4000,
            TopP = 1,
            Stream = false,
            //Tools = new List<Tool>
            //{
            //    new Tool
            //    {
            //        Name = "string",
            //        Description = "string",
            //        Parameters = new List<ToolParameter>
            //        {
            //            new ToolParameter
            //            {
            //                Name = "string",
            //                Type = "string",
            //                Description = "string",
            //                Required = false
            //            }
            //        }
            //    }
            //},
            EnableCaching = false
        };

        var response = await _client.PostAsJsonAsync("/v1/chat/completions", payload);
        var responseString = await response.Content.ReadAsStringAsync();

        // Fail with the response body included so you can see the server error in test output.
        Assert.True(response.IsSuccessStatusCode, $"Status code: {response.StatusCode}, body: {responseString}");

        // If success, parse into your expected model.
        var result = JsonSerializer.Deserialize<CompletionResponse>(responseString);
        Assert.NotNull(result);
        string? message = result!.choices[0]?.message?.content;
        Assert.False(string.IsNullOrWhiteSpace(message), "Empty analysis result");
    }
}