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
    latitude: 59.3293,
    longitude: 18.0686
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
    latitude: 59.4006,
    longitude: 18.1289
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
    name: "Wittsjö Golfklubb",
    location: "Skåne",
    image: course1,
    latitude: 56.1045,
    longitude: 13.3333
  }
];