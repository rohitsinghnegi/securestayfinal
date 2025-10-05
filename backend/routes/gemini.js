import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Import the Room model to fetch property data
import Room from "../models/Room.js";

// Load environment variables from your custom file
dotenv.config({ path: './backend.env' });

const router = express.Router();

let genAI;

// Function to safely initialize the Gemini AI client
const initializeGenAI = () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey === "") {
      console.error("Gemini API key is not configured. Please check your backend.env file.");
      return null;
    }
    console.log("Gemini AI initialized successfully");
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error.message);
    return null;
  }
};

genAI = initializeGenAI();

// Helper function to format properties for the AI prompt
const formatPropertiesForPrompt = (properties) => {
  return properties.map(property => {
    return {
      id: property._id.toString(), // Include property ID
      title: property.title,
      description: property.description,
      price: property.pricePerMonth,
      location: `${property.location?.city || 'Unknown'}, ${property.location?.state || 'Unknown'}`,
      address: property.address,
      roomType: property.roomType,
      amenities: property.amenities?.join(', ') || 'None',
      features: property.features?.join(', ') || 'None',
      nearbyPlaces: property.nearbyPlaces?.join(', ') || 'None',
      size: property.size ? `${property.size.area} sq ft, ${property.size.bedrooms} bed, ${property.size.bathrooms} bath` : 'Not specified',
      available: property.available ? 'Yes' : 'No'
    };
  });
};

// Chat endpoint
router.post("/chat", async (req, res) => {
  if (!genAI) {
    genAI = initializeGenAI();
    if (!genAI) {
      return res.status(500).json({
        success: false,
        error: "Chatbot service is currently unavailable. Please try again later.",
      });
    }
  }

  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: "Message is required" 
      });
    }

    console.log("Received chat request:", message);

    // Determine if the user is asking about properties or just having a conversation
    const userMessageLower = message.toLowerCase();
    
    // Strong indicators that user wants to see properties
    const strongPropertyKeywords = [
      'property', 'properties', 'room', 'rooms', 'apartment', 'apartments',
      'house', 'houses', 'accommodation', 'studio', 'bhk', 'flat', 'flats',
      'pg', 'hostel', 'listing', 'listings'
    ];
    
    // Action words that combined with context suggest property search
    const propertyActionPhrases = [
      'find a room', 'find room', 'find property', 'find properties',
      'show me room', 'show me property', 'show me properties', 'show room',
      'search for room', 'search room', 'search property',
      'looking for room', 'looking for property', 'looking for accommodation',
      'need a room', 'need room', 'need property', 'need accommodation',
      'want a room', 'want room', 'want property', 'want accommodation',
      'under ₹', 'under rs', 'budget of', 'price range',
      'near university', 'near college', 'in indore', 'in delhi', 'in mumbai',
      'with wifi', 'with parking', 'with gym'
    ];
    
    // Check if message contains strong property keywords or action phrases
    const hasStrongKeyword = strongPropertyKeywords.some(keyword => 
      userMessageLower.includes(keyword)
    );
    
    const hasActionPhrase = propertyActionPhrases.some(phrase => 
      userMessageLower.includes(phrase)
    );
    
    const isPropertyQuery = hasStrongKeyword || hasActionPhrase;

    // If not asking about properties, give a general helpful response
    if (!isPropertyQuery) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512,
        }
      });

      const generalPrompt = `
You are "SecureStay Assistant", a friendly AI helper for a student housing platform called SecureStay.
You help students with:
- General questions about student housing
- Rental agreements and contracts
- Safety tips for students
- Moving and relocation advice
- Budgeting for accommodation
- Rights and responsibilities as a tenant

IMPORTANT: The user is NOT asking about specific properties right now. They are asking a general question.

User's question: "${message.trim()}"

Provide a helpful, friendly, and conversational response. Keep it concise (2-3 sentences). 
If appropriate, mention that you can also help them find specific properties if they need.
`;

      const result = await model.generateContent(generalPrompt);
      const response = await result.response;
      const text = response.text().trim();

      return res.json({
        success: true,
        message: text,
        properties: [],
        propertiesCount: 0
      });
    }

    // User IS asking about properties - fetch and provide suggestions
    const properties = await Room.find({ available: true }).lean();
    
    if (properties.length === 0) {
      return res.json({
        success: true,
        message: "I'm here to help you find student accommodation! Currently, there are no available properties in our database. Please check back later or contact support for more information.",
        properties: []
      });
    }

    console.log(`Found ${properties.length} properties for AI analysis`);

    // Format properties for the AI prompt (include IDs)
    const formattedProperties = formatPropertiesForPrompt(properties);

    // Create a detailed, structured prompt with specific response format instructions
    const prompt = `
CONTEXT:
You are "SecureStay Assistant", a helpful AI for SecureStay - a student housing rental platform. 
The user is looking for accommodation. Help them find suitable properties.

AVAILABLE PROPERTIES DATA:
${JSON.stringify(formattedProperties, null, 2)}

RESPONSE FORMAT REQUIREMENTS:
1. First, provide a friendly, conversational response to the user's query
2. Then, for each property you recommend, provide it in this EXACT JSON format within triple backticks:
\`\`\`property
{
  "id": "property_id_here",
  "title": "Property Title",
  "price": 8000,
  "location": "City, State",
  "roomType": "single",
  "amenities": ["WiFi", "AC"],
  "description": "Brief description"
}
\`\`\`

3. Recommend 1-5 properties that BEST match the user's requirements
4. Only recommend properties that truly match the user's needs
5. After the property blocks, add a helpful closing remark

CRITICAL INSTRUCTIONS:
- You MUST include property blocks in the exact format shown above
- Each property block must be wrapped in \`\`\`property and \`\`\` 
- The JSON inside each block must be valid and complete
- Use the exact property IDs from the provided data
- Carefully analyze the user's query and match it with the MOST relevant properties
- ONLY use information from the provided properties list
- Be conversational, friendly, and helpful
- If user has specific requirements (budget, location, amenities), prioritize those

USER'S QUESTION: "${message.trim()}"

Your response:
`;

    // 4. Send the prompt to Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    console.log("AI Response generated successfully");

    // 5. Parse the response to extract properties and message
    const { parsedMessage, properties: extractedProperties } = parseAIResponse(text, properties);

    // If no properties were extracted, use fallback
    if (extractedProperties.length === 0) {
      console.log("No properties extracted from AI response, using fallback...");
      const { fallbackMessage, matchedProperties } = getFallbackResponse(message, properties);
      
      res.json({
        success: true,
        message: fallbackMessage,
        properties: matchedProperties,
        propertiesCount: matchedProperties.length,
        isFallback: true
      });
    } else {
      res.json({
        success: true,
        message: parsedMessage,
        properties: extractedProperties,
        propertiesCount: extractedProperties.length
      });
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Fallback response if AI fails
    const properties = await Room.find({ available: true }).lean();
    
    // Simple fallback property matching
    const userMessage = req.body.message?.toLowerCase() || '';
    const { fallbackMessage, matchedProperties } = getFallbackResponse(userMessage, properties);
    
    res.json({
      success: true,
      message: fallbackMessage,
      properties: matchedProperties,
      propertiesCount: matchedProperties.length,
      isFallback: true
    });
  }
});

// Function to parse AI response and extract properties
function parseAIResponse(aiResponse, allProperties) {
  let parsedMessage = aiResponse;
  const extractedProperties = [];

  console.log("AI Response received:", aiResponse.substring(0, 500) + "...");

  try {
    // Try multiple regex patterns to catch different formats
    const propertyBlockRegexes = [
      /```property\n([\s\S]*?)\n```/g,
      /```property\s*\n([\s\S]*?)\n```/g,
      /```\s*property\s*\n([\s\S]*?)\n```/g,
      /```property([\s\S]*?)```/g
    ];
    
    let foundProperties = false;
    
    for (const regex of propertyBlockRegexes) {
      let match;
      while ((match = regex.exec(aiResponse)) !== null) {
        foundProperties = true;
        try {
          const propertyData = JSON.parse(match[1].trim());
          console.log("Parsed property data:", propertyData);
          
          // Verify the property exists in our database and enrich with full data
          const fullProperty = allProperties.find(p => p._id.toString() === propertyData.id);
          if (fullProperty) {
            extractedProperties.push({
              id: propertyData.id,
              title: propertyData.title,
              price: propertyData.price,
              location: propertyData.location,
              roomType: propertyData.roomType,
              amenities: propertyData.amenities,
              description: propertyData.description,
              images: fullProperty.images || [],
              address: fullProperty.address,
              features: fullProperty.features || [],
              nearbyPlaces: fullProperty.nearbyPlaces || [],
              link: `/property/${propertyData.id}` // Frontend link
            });
            console.log("Successfully added property:", propertyData.title);
          } else {
            console.log("Property not found in database:", propertyData.id);
          }
        } catch (parseError) {
          console.error("Error parsing property block:", parseError);
          console.error("Raw property data:", match[1]);
        }
      }
    }

    // If no properties found in blocks, try to extract from the text
    if (!foundProperties) {
      console.log("No property blocks found, trying fallback parsing...");
      
      // Look for property mentions in the text and try to match them
      const propertyMentions = aiResponse.match(/\b[A-Z][a-z\s]+(?:Apartment|Room|Studio|House|PG)\b/g);
      if (propertyMentions) {
        console.log("Found property mentions:", propertyMentions);
        
        // Try to match mentioned properties with our database
        for (const mention of propertyMentions) {
          const matchingProperty = allProperties.find(p => 
            p.title.toLowerCase().includes(mention.toLowerCase()) ||
            mention.toLowerCase().includes(p.title.toLowerCase())
          );
          
          if (matchingProperty) {
            extractedProperties.push({
              id: matchingProperty._id.toString(),
              title: matchingProperty.title,
              price: matchingProperty.pricePerMonth,
              location: `${matchingProperty.location?.city || 'Unknown'}, ${matchingProperty.location?.state || 'Unknown'}`,
              roomType: matchingProperty.roomType,
              amenities: matchingProperty.amenities || [],
              description: matchingProperty.description,
              images: matchingProperty.images || [],
              address: matchingProperty.address,
              features: matchingProperty.features || [],
              nearbyPlaces: matchingProperty.nearbyPlaces || [],
              link: `/property/${matchingProperty._id}`
            });
            console.log("Added property from mention:", matchingProperty.title);
          }
        }
      }
    }

    // Remove property blocks from the message for clean display
    for (const regex of propertyBlockRegexes) {
      parsedMessage = parsedMessage.replace(regex, '').trim();
    }

    console.log(`Extracted ${extractedProperties.length} properties from AI response`);

  } catch (error) {
    console.error("Error parsing AI response:", error);
  }

  return { parsedMessage, properties: extractedProperties };
}

// Fallback response when AI fails
function getFallbackResponse(userMessage, allProperties) {
  let matchedProperties = [];
  let fallbackMessage = "I found these properties that might interest you:";

  console.log("Using fallback response for query:", userMessage);

  // Simple keyword-based matching for fallback
  if (userMessage.includes('cheap') || userMessage.includes('budget') || userMessage.includes('low price') || userMessage.includes('under')) {
    const priceMatch = userMessage.match(/under\s+₹?(\d+)/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) : 10000;
    matchedProperties = allProperties
      .filter(p => p.pricePerMonth <= maxPrice)
      .slice(0, 5)
      .map(p => ({
        id: p._id.toString(),
        title: p.title,
        price: p.pricePerMonth,
        location: `${p.location?.city || 'Unknown'}, ${p.location?.state || 'Unknown'}`,
        roomType: p.roomType,
        amenities: p.amenities || [],
        description: p.description,
        images: p.images || [],
        address: p.address,
        features: p.features || [],
        nearbyPlaces: p.nearbyPlaces || [],
        link: `/property/${p._id}`
      }));
    fallbackMessage = `Here are some budget-friendly options under ₹${maxPrice}:`;
    console.log(`Budget filter applied: ${matchedProperties.length} properties under ₹${maxPrice}`);
  } 
  else if (userMessage.includes('wifi') || userMessage.includes('parking') || userMessage.includes('ac') || userMessage.includes('kitchen')) {
    // Filter by amenities
    const amenityKeywords = ['wifi', 'parking', 'ac', 'kitchen', 'gym', 'pool', 'security'];
    const requestedAmenities = amenityKeywords.filter(amenity => 
      userMessage.toLowerCase().includes(amenity)
    );
    
    matchedProperties = allProperties
      .filter(p => requestedAmenities.every(amenity => 
        p.amenities.some(propAmenity => 
          propAmenity.toLowerCase().includes(amenity)
        )
      ))
      .slice(0, 5)
      .map(p => ({
        id: p._id.toString(),
        title: p.title,
        price: p.pricePerMonth,
        location: `${p.location?.city || 'Unknown'}, ${p.location?.state || 'Unknown'}`,
        roomType: p.roomType,
        amenities: p.amenities || [],
        description: p.description,
        images: p.images || [],
        address: p.address,
        features: p.features || [],
        nearbyPlaces: p.nearbyPlaces || [],
        link: `/property/${p._id}`
      }));
    fallbackMessage = `Here are properties with ${requestedAmenities.join(', ')}:`;
    console.log(`Amenity filter applied: ${matchedProperties.length} properties with ${requestedAmenities.join(', ')}`);
  }
  else if (userMessage.includes('studio') || userMessage.includes('apartment')) {
    matchedProperties = allProperties
      .filter(p => p.roomType?.toLowerCase().includes('studio') || p.roomType?.toLowerCase().includes('apartment'))
      .slice(0, 5)
      .map(p => ({
        id: p._id.toString(),
        title: p.title,
        price: p.pricePerMonth,
        location: `${p.location?.city || 'Unknown'}, ${p.location?.state || 'Unknown'}`,
        roomType: p.roomType,
        amenities: p.amenities || [],
        description: p.description,
        images: p.images || [],
        address: p.address,
        features: p.features || [],
        nearbyPlaces: p.nearbyPlaces || [],
        link: `/property/${p._id}`
      }));
    fallbackMessage = "Here are some studio and apartment options:";
    console.log(`Room type filter applied: ${matchedProperties.length} properties`);
  }
  else {
    // Return random 5 properties as fallback
    matchedProperties = allProperties
      .slice(0, 5)
      .map(p => ({
        id: p._id.toString(),
        title: p.title,
        price: p.pricePerMonth,
        location: `${p.location?.city || 'Unknown'}, ${p.location?.state || 'Unknown'}`,
        roomType: p.roomType,
        amenities: p.amenities || [],
        description: p.description,
        images: p.images || [],
        address: p.address,
        features: p.features || [],
        nearbyPlaces: p.nearbyPlaces || [],
        link: `/property/${p._id}`
      }));
    console.log("No specific filters applied, returning random properties");
  }

  console.log(`Fallback returning ${matchedProperties.length} properties`);
  return { fallbackMessage, matchedProperties };
}

// Health check endpoint for Gemini service
router.get("/health", async (req, res) => {
  if (!genAI) {
    return res.json({
      service: "gemini",
      status: "disabled",
      message: "Gemini API key not configured"
    });
  }

  try {
    // Test the API with a simple prompt
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent("Say 'OK' if you're working.");
    const response = await result.response;
    
    res.json({
      service: "gemini",
      status: "active",
      message: "Gemini AI is working correctly",
      testResponse: response.text()
    });
  } catch (error) {
    res.json({
      service: "gemini",
      status: "error",
      message: "Gemini AI is not responding",
      error: error.message
    });
  }
});

// Get available property statistics
router.get("/property-stats", async (req, res) => {
  try {
    const totalProperties = await Room.countDocuments({ available: true });
    const cities = await Room.distinct('location.city', { available: true });
    const priceRange = await Room.aggregate([
      { $match: { available: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$pricePerMonth" },
          maxPrice: { $max: "$pricePerMonth" },
          avgPrice: { $avg: "$pricePerMonth" }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalProperties,
        availableCities: cities.filter(city => city).length,
        cities: cities.filter(city => city),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 }
      }
    });
  } catch (error) {
    console.error("Error fetching property stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch property statistics"
    });
  }
});

export default router;