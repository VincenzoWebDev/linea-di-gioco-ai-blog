const regionCoordinates = [
    { match: "medio oriente", label: "31.7683 N / 35.2137 E" },
    { match: "europa", label: "50.1109 N / 8.6821 E" },
    { match: "africa", label: "9.0820 N / 8.6753 E" },
    { match: "asia", label: "34.0479 N / 100.6197 E" },
    { match: "ucraina", label: "50.4501 N / 30.5234 E" },
    { match: "russia", label: "55.7558 N / 37.6173 E" },
    { match: "cina", label: "39.9042 N / 116.4074 E" },
    { match: "usa", label: "38.9072 N / 77.0369 W" },
    { match: "stati uniti", label: "38.9072 N / 77.0369 W" },
    { match: "mediterraneo", label: "35.0000 N / 18.0000 E" },
];

export function findCoordinates(article) {
    const region = [
        article.tension?.region_name,
        article.topic,
        ...(article.categories || []),
        article.title,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    return (
        regionCoordinates.find((item) => region.includes(item.match))?.label ||
        "41.9028 N / 12.4964 E"
    );
}
