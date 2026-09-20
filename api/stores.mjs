export async function GET(request) {
  try {
    const url = new URL(request.url);
    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return Response.json(
        { success: false, error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return Response.json(
        { success: false, error: "Invalid coordinates." },
        { status: 400 }
      );
    }

    // Search roughly 8 km / 5 miles around the shopper.
    const radius = 8000;

    const query = `
      [out:json][timeout:20];
      nwr["shop"~"^(supermarket|grocery)$"](around:${radius},${lat},${lon});
      out center tags;
    `;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Sale-to-Supper/1.0"
        },
        body: new URLSearchParams({ data: query })
      }
    );

    if (!response.ok) {
      throw new Error(`Store service returned ${response.status}`);
    }

    const data = await response.json();

    const stores = data.elements
      .map((place) => {
        const storeLat = place.lat ?? place.center?.lat;
        const storeLon = place.lon ?? place.center?.lon;

        return {
          id: `${place.type}-${place.id}`,
          name:
            place.tags?.name ||
            place.tags?.brand ||
            place.tags?.operator ||
            "Grocery store",
          brand: place.tags?.brand || "",
          address: [
            place.tags?.["addr:housenumber"],
            place.tags?.["addr:street"]
          ]
            .filter(Boolean)
            .join(" "),
          lat: storeLat,
          lon: storeLon
        };
      })
      .filter(
        (store) =>
          store.name !== "Grocery store" &&
          Number.isFinite(store.lat) &&
          Number.isFinite(store.lon)
      );

    // Remove duplicate locations/names.
    const uniqueStores = Array.from(
      new Map(
        stores.map((store) => [
          `${store.name.toLowerCase()}-${store.lat}-${store.lon}`,
          store
        ])
      ).values()
    ).slice(0, 25);

    return Response.json({
      success: true,
      count: uniqueStores.length,
      stores: uniqueStores
    });
  } catch (error) {
    console.error("Store lookup failed:", error);

    return Response.json(
      {
        success: false,
        error: "We couldn't find nearby supermarkets right now."
      },
      { status: 500 }
    );
  }
}
