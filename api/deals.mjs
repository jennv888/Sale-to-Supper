export async function GET(request) {
  try {
    const url = new URL(request.url);

    const storeName = url.searchParams.get("store");
    const address = url.searchParams.get("address") || "";
    const zip = url.searchParams.get("zip") || "";
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");

    if (!storeName) {
      return Response.json(
        {
          success: false,
          error: "A supermarket is required."
        },
        { status: 400 }
      );
    }

    const store = {
      name: storeName,
      address,
      zip,
      lat: lat ? Number(lat) : null,
      lon: lon ? Number(lon) : null
    };

    // Safeway gets its own retailer connection.
    // We are NOT labeling any prices as live until they
    // have been retrieved from a verified current source.
    if (storeName.toLowerCase().includes("safeway")) {
      return Response.json({
        success: true,
        retailer: "safeway",
        store,
        deals: [],
        liveDeals: false,
        message: address
          ? `Safeway selected: ${address}. Store identified and ready for weekly-ad connection.`
          : `Safeway selected. Store identified and ready for weekly-ad connection.`
      });
    }

    // Other supermarkets will get their own adapters later.
    return Response.json({
      success: true,
      retailer: "other",
      store,
      deals: [],
      liveDeals: false,
      message: `${storeName} selected. Weekly-ad connection coming next.`
    });

  } catch (error) {
    console.error("Deals lookup failed:", error);

    return Response.json(
      {
        success: false,
        error: "We couldn't load weekly deals right now."
      },
      { status: 500 }
    );
  }
}
