using System.Net.Http.Headers;
using System.Text.Json.Serialization.Metadata;

namespace ImageAIProxy;

/// <summary>
/// Provides methods to interact with the external LLM API.
/// </summary>
public static class FridaLlmApiClient
{
    private static readonly string EndpointUrl = "https://frida-llm-api.azurewebsites.net/v1/chat/completions";
    private static readonly string BearerToken = "vizeE6PMyaLY94NosV3J";

    /// <summary>
    /// Sends a POST request with the specified payload as JSON, using a bearer token for authentication,
    /// optimized for AOT scenarios (uses JsonTypeInfo).
    /// </summary>
    /// <typeparam name="TPayload">The payload type.</typeparam>
    /// <param name="httpClient">Instance of HttpClient.</param>
    /// <param name="payload">Payload to send.</param>
    /// <param name="jsonTypeInfo">JsonTypeInfo for TPayload.</param>
    /// <returns>HttpResponseMessage.</returns>
    public static async Task<HttpResponseMessage> AnalyzeAsync<TPayload>(
        HttpClient httpClient,
        TPayload payload,
        JsonTypeInfo<TPayload> jsonTypeInfo
        )
    {
        var request = new HttpRequestMessage(HttpMethod.Post, EndpointUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", BearerToken);
        request.Content = JsonContent.Create(payload, jsonTypeInfo: jsonTypeInfo);

        return await httpClient.SendAsync(request);
    }
}