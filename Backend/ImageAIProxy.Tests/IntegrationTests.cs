using Microsoft.AspNetCore.Components.Forms;
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
                            Text = "Analyze the following image encoded in base64"
                        },
                        new ContentItem
                        {
                            Type = "image_url",
                            ImageUrl = new ImageUrlContent
                            {
                                Url = "data:image/jpeg;base64," + base64Image,
                                Detail = "Analyze this image and provide a concise JSON description as specified."
                            }
                        }
                    }
                }
            },
            Stream = false,
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