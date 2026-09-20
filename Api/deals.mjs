export async function GET(request) {
  try {
    const url = new URL(request.url);

    const storeName = url.searchParams.get("store");
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

    /*
      Sale to Supper deals service.

      Next, this endpoint will connect each supermarket
      to its live weekly-ad source.

      For now we're testing that the selected store can
      travel successfully from the website to this API.
    */

    return Response.json({
      success: true,
      store: {
        name: storeName,
        lat: lat ? Number(lat) : null,
        lon: lon ? Number(lon) : null
      },
      deals: [],
      message: `Ready to find weekly deals for ${storeName}.`
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
