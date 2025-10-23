using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace ImageAIProxy;

/// <summary>
/// New request payload that serializes to the required JSON shape (snake_case)
/// matching the example provided.
/// </summary>
public class ModelRequest
{
    [JsonPropertyName("model")]
    public string Model { get; set; }

    [JsonPropertyName("messages")]
    public List<RequestMessage> Messages { get; set; }

    [JsonPropertyName("stream")]
    public bool Stream { get; set; }

    [JsonPropertyName("enable_caching")]
    public bool EnableCaching { get; set; }
}

public class RequestMessage
{
    [JsonPropertyName("role")]
    public string Role { get; set; }

    [JsonPropertyName("content")]
    public List<ContentItem> Content { get; set; }
}

public class ContentItem
{
    [JsonPropertyName("type")]
    public string Type { get; set; }

    // For type == "text"
    [JsonPropertyName("text")]
    public string Text { get; set; }

    // For type == "image_url"
    [JsonPropertyName("image_url")]
    public ImageUrlContent ImageUrl { get; set; }
}

public class ImageUrlContent
{
    [JsonPropertyName("url")]
    public string Url { get; set; }

    [JsonPropertyName("detail")]
    public string Detail { get; set; }
}

// Optional: keep Tool/ToolParameter if used elsewhere in project
public class Tool
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("parameters")]
    public List<ToolParameter> Parameters { get; set; }
}

public class ToolParameter
{
    [JsonPropertyName("name")]
    public string Name { get; set; }

    [JsonPropertyName("type")]
    public string Type { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }

    [JsonPropertyName("required")]
    public bool Required { get; set; }
}

// Completion response classes (kept for compatibility)
public class CompletionResponse
{
    public Choice[] choices { get; set; }
}

public class Choice
{
    public CompletionMessage message { get; set; }
}

public class CompletionMessage
{
    public string role { get; set; }
    public string content { get; set; }
}
