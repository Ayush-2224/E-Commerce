public static class FeatureFlags
{
    public const string EnableNewDashboard = "EnableNewDashboard";
    public const string EnableExperimentalAnalytics = "EnableExperimentalAnalytics";
    public const string EnableGemini25ProPreview = "EnableGemini25ProPreview";

    public static bool IsEnabled(string featureName)
    {
        // In a real application, this would check a configuration source (e.g., database, config file, launch darkly)
        // For this example, we'll hardcode the enabled features.
        return featureName switch
        {
            EnableNewDashboard => true, // Example: New Dashboard is enabled
            EnableExperimentalAnalytics => false, // Example: Experimental Analytics is disabled
            EnableGemini25ProPreview => true, // Enable Gemini 2.5 Pro (Preview) for all clients
            _ => false, // Default to false for any unknown feature
        };
    }
}