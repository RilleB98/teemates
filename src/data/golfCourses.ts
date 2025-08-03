import course1 from "@/assets/course1.jpg";

export interface Course {
  name: string;
  location: string;
  image: string;
  latitude: number;
  longitude: number;
}

export const golfCourses: Course[] = [
  // Stockholm Region
  {
    name: "Bro Hof Slott Golf Club",
    location: "Stockholm",
    image: course1,
    latitude: 59.4956,
    longitude: 17.6258  // Corrected coordinates from search results
  },
  {
    name: "Stockholms Golfklubb",
    location: "Stockholm",
    image: course1,
    latitude: 59.3515,
    longitude: 18.1806
  },
  {
    name: "Rålambshovs Golf",
    location: "Stockholm",
    image: course1,
    latitude: 59.3347,
    longitude: 18.0297
  },
  {
    name: "Kaknäs Golf",
    location: "Stockholm",
    image: course1,
    latitude: 59.3511,
    longitude: 18.1194
  },
  {
    name: "Wermdö Golf & Country Club",
    location: "Stockholm",
    image: course1,
    latitude: 59.2503,
    longitude: 18.3667
  },
  {
    name: "Djursholms Golfklubb",
    location: "Stockholm",
    image: course1,
    latitude: 59.3056,
    longitude: 18.2278
  },
  {
    name: "Kevinge Golf & Country Club",
    location: "Stockholm",
    image: course1,
    latitude: 59.4847,
    longitude: 17.9158
  },
  {
    name: "Österåkers Golfklubb",
    location: "Stockholm",
    image: course1,
    latitude: 59.4583,
    longitude: 18.3333
  },
  {
    name: "Viksjö Golfklubb",
    location: "Stockholm",
    image: course1,
    latitude: 59.4167,
    longitude: 17.8833
  },
  {
    name: "Saltsjöbadens Golfklubb",
    location: "Stockholm",
    image: course1,
    latitude: 59.2833,
    longitude: 18.3167
  },
  {
    name: "Ågesta Golfklubb",
    location: "Stockholm",
    image: course1,
    latitude: 59.2403,
    longitude: 18.0331
  },
  {
    name: "Kungl. Drottningholms Golfklubb",
    location: "Stockholm",
    image: course1,
    latitude: 59.3220,
    longitude: 17.8592  // From Wikipedia search results
  },
  
  // Skåne Region
  {
    name: "Falsterbo Golf Club",
    location: "Skåne",
    image: course1,
    latitude: 55.3830,
    longitude: 12.8330  // From Wikipedia search results
  },
  {
    name: "Ljunghusen Golf Club",
    location: "Skåne",
    image: course1,
    latitude: 55.4000,
    longitude: 12.9170  // From Wikipedia search results
  },
  {
    name: "Barsebäck Golf & Country Club",
    location: "Skåne",
    image: course1,
    latitude: 55.7950,
    longitude: 12.9490  // From Wikipedia search results
  },
  {
    name: "Wittsjö Golfklubb",
    location: "Skåne",
    image: course1,
    latitude: 56.1045,
    longitude: 13.3333
  },
  {
    name: "Malmö Burlövs Golfklubb",
    location: "Skåne",
    image: course1,
    latitude: 55.6059,
    longitude: 13.0007  // Near Malmö coordinates
  },
  {
    name: "Flommens Golf Club",
    location: "Skåne",
    image: course1,
    latitude: 55.3850,
    longitude: 12.8200  // Near Falsterbo
  },
  
  // Gothenburg Region
  {
    name: "Göteborg Golfklubb",
    location: "Göteborg",
    image: course1,
    latitude: 57.7089,
    longitude: 11.9746
  },
  {
    name: "Chalmers Golfklubb",
    location: "Göteborg",
    image: course1,
    latitude: 57.6650,
    longitude: 12.0450
  },
  
  // Other Regions
  {
    name: "Halmstad Golfklubb",
    location: "Halland",
    image: course1,
    latitude: 56.6634,
    longitude: 12.8231
  },
  {
    name: "Uppsala Golfklubb",
    location: "Uppsala",
    image: course1,
    latitude: 59.8586,
    longitude: 17.6389
  },
  {
    name: "Västerås Golfklubb",
    location: "Västmanland",
    image: course1,
    latitude: 59.6099,
    longitude: 16.5448
  },
  {
    name: "Örebro Golfklubb",
    location: "Örebro",
    image: course1,
    latitude: 59.2741,
    longitude: 15.2066
  }
];