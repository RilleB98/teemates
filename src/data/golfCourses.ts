import course1 from "@/assets/course1.jpg";

export interface Course {
  name: string;
  location: string;
  rating: number;
  difficulty: string;
  holes: number;
  price: string;
  image: string;
  latitude: number;
  longitude: number;
}

export const golfCourses: Course[] = [
  // Stockholm Region
  {
    name: "Bro Hof Slott Golf Club",
    location: "Stockholm",
    rating: 4.9,
    difficulty: "Hard",
    holes: 18,
    price: "950 SEK",
    image: course1,
    latitude: 59.3293,
    longitude: 18.0686
  },
  {
    name: "Stockholms Golfklubb",
    location: "Stockholm",
    rating: 4.8,
    difficulty: "Hard",
    holes: 18,
    price: "900 SEK",
    image: course1,
    latitude: 59.3515,
    longitude: 18.1806
  },
  {
    name: "Rålambshovs Golf",
    location: "Stockholm",
    rating: 4.2,
    difficulty: "Easy",
    holes: 9,
    price: "350 SEK",
    image: course1,
    latitude: 59.3347,
    longitude: 18.0297
  },
  {
    name: "Kaknäs Golf",
    location: "Stockholm",
    rating: 4.1,
    difficulty: "Easy",
    holes: 9,
    price: "400 SEK",
    image: course1,
    latitude: 59.3511,
    longitude: 18.1194
  },
  {
    name: "Wermdö Golf & Country Club",
    location: "Stockholm",
    rating: 4.8,
    difficulty: "Medium",
    holes: 18,
    price: "850 SEK",
    image: course1,
    latitude: 59.2503,
    longitude: 18.3667
  },
  {
    name: "Djursholms Golfklubb",
    location: "Stockholm",
    rating: 4.6,
    difficulty: "Medium",
    holes: 18,
    price: "800 SEK",
    image: course1,
    latitude: 59.4006,
    longitude: 18.1289
  },
  {
    name: "Kevinge Golf & Country Club",
    location: "Stockholm",
    rating: 4.5,
    difficulty: "Easy",
    holes: 18,
    price: "700 SEK",
    image: course1,
    latitude: 59.4847,
    longitude: 17.9158
  },
  {
    name: "Österåkers Golfklubb",
    location: "Stockholm",
    rating: 4.4,
    difficulty: "Medium",
    holes: 18,
    price: "750 SEK",
    image: course1,
    latitude: 59.4583,
    longitude: 18.3333
  },
  {
    name: "Viksjö Golfklubb",
    location: "Stockholm",
    rating: 4.3,
    difficulty: "Easy",
    holes: 18,
    price: "650 SEK",
    image: course1,
    latitude: 59.4167,
    longitude: 17.8833
  },
  {
    name: "Saltsjöbadens Golfklubb",
    location: "Stockholm",
    rating: 4.7,
    difficulty: "Medium",
    holes: 18,
    price: "800 SEK",
    image: course1,
    latitude: 59.2833,
    longitude: 18.3167
  },

  // Göteborg Region
  {
    name: "Hills Golf Club",
    location: "Göteborg",
    rating: 4.7,
    difficulty: "Medium",
    holes: 18,
    price: "750 SEK",
    image: course1,
    latitude: 57.7089,
    longitude: 11.9746
  },
  {
    name: "Göteborgs Golfklubb",
    location: "Göteborg",
    rating: 4.6,
    difficulty: "Hard",
    holes: 18,
    price: "800 SEK",
    image: course1,
    latitude: 57.7211,
    longitude: 11.9653
  },
  {
    name: "Albatross Golf Club",
    location: "Göteborg",
    rating: 4.5,
    difficulty: "Medium",
    holes: 18,
    price: "700 SEK",
    image: course1,
    latitude: 57.6558,
    longitude: 12.0558
  },
  {
    name: "Chalmers Golfklubb",
    location: "Göteborg",
    rating: 4.3,
    difficulty: "Easy",
    holes: 18,
    price: "600 SEK",
    image: course1,
    latitude: 57.6833,
    longitude: 11.9833
  },
  {
    name: "Delsjö Golf Club",
    location: "Göteborg",
    rating: 4.4,
    difficulty: "Medium",
    holes: 18,
    price: "650 SEK",
    image: course1,
    latitude: 57.6675,
    longitude: 12.0558
  },

  // Malmö Region
  {
    name: "Malmö Burlöv Golf Club",
    location: "Malmö",
    rating: 4.6,
    difficulty: "Easy",
    holes: 18,
    price: "650 SEK",
    image: course1,
    latitude: 55.6050,
    longitude: 13.0038
  },
  {
    name: "PGA Sweden National",
    location: "Malmö",
    rating: 4.8,
    difficulty: "Hard",
    holes: 36,
    price: "900 SEK",
    image: course1,
    latitude: 55.5733,
    longitude: 13.1089
  },
  {
    name: "Falsterbo Golfklubb",
    location: "Malmö",
    rating: 4.7,
    difficulty: "Medium",
    holes: 18,
    price: "750 SEK",
    image: course1,
    latitude: 55.3892,
    longitude: 12.8306
  },
  {
    name: "Ljunghusens Golfklubb",
    location: "Malmö",
    rating: 4.5,
    difficulty: "Medium",
    holes: 27,
    price: "700 SEK",
    image: course1,
    latitude: 55.4167,
    longitude: 12.9000
  },
  {
    name: "Flommens Golfklubb",
    location: "Malmö",
    rating: 4.3,
    difficulty: "Easy",
    holes: 18,
    price: "550 SEK",
    image: course1,
    latitude: 55.5833,
    longitude: 13.0500
  },

  // Dalarna
  {
    name: "Falun-Borlänge Golfklubb",
    location: "Dalarna",
    rating: 4.4,
    difficulty: "Medium",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 60.6089,
    longitude: 15.6356
  },
  {
    name: "Rättvik Golfklubb",
    location: "Dalarna",
    rating: 4.2,
    difficulty: "Easy",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 60.8833,
    longitude: 15.1167
  },
  {
    name: "Siljans Golfklubb",
    location: "Dalarna",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 60.7333,
    longitude: 14.8667
  },

  // Småland
  {
    name: "Växjö Golfklubb",
    location: "Småland",
    rating: 4.4,
    difficulty: "Medium",
    holes: 18,
    price: "520 SEK",
    image: course1,
    latitude: 56.8667,
    longitude: 14.8000
  },
  {
    name: "Kalmar Golfklubb",
    location: "Småland",
    rating: 4.3,
    difficulty: "Easy",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 56.6614,
    longitude: 16.3606
  },
  {
    name: "Öland Golfklubb",
    location: "Småland",
    rating: 4.5,
    difficulty: "Medium",
    holes: 18,
    price: "600 SEK",
    image: course1,
    latitude: 56.6833,
    longitude: 16.4000
  },
  {
    name: "Nybro Golfklubb",
    location: "Småland",
    rating: 4.1,
    difficulty: "Easy",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 56.7333,
    longitude: 15.9000
  },

  // Västergötland
  {
    name: "Skövde Golfklubb",
    location: "Västergötland",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 58.3833,
    longitude: 13.8500
  },
  {
    name: "Borås Golfklubb",
    location: "Västergötland",
    rating: 4.2,
    difficulty: "Easy",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 57.7167,
    longitude: 12.9167
  },
  {
    name: "Tidaholms Golfklubb",
    location: "Västergötland",
    rating: 4.1,
    difficulty: "Easy",
    holes: 18,
    price: "420 SEK",
    image: course1,
    latitude: 58.1833,
    longitude: 13.9500
  },

  // Halland
  {
    name: "Halmstad Golfklubb",
    location: "Halland",
    rating: 4.6,
    difficulty: "Hard",
    holes: 36,
    price: "700 SEK",
    image: course1,
    latitude: 56.6745,
    longitude: 12.8578
  },
  {
    name: "Tylösands Golfklubb",
    location: "Halland",
    rating: 4.5,
    difficulty: "Medium",
    holes: 18,
    price: "650 SEK",
    image: course1,
    latitude: 56.6833,
    longitude: 12.7167
  },
  {
    name: "Varbergs Golfklubb",
    location: "Halland",
    rating: 4.4,
    difficulty: "Medium",
    holes: 18,
    price: "580 SEK",
    image: course1,
    latitude: 57.1056,
    longitude: 12.2506
  },
  {
    name: "Laholms Golfklubb",
    location: "Halland",
    rating: 4.2,
    difficulty: "Easy",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 56.5167,
    longitude: 13.0500
  },

  // Östergötland
  {
    name: "Linköpings Golfklubb",
    location: "Östergötland",
    rating: 4.4,
    difficulty: "Medium",
    holes: 18,
    price: "550 SEK",
    image: course1,
    latitude: 58.4167,
    longitude: 15.6167
  },
  {
    name: "Norrköpings Golfklubb",
    location: "Östergötland",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "520 SEK",
    image: course1,
    latitude: 58.5869,
    longitude: 16.1872
  },
  {
    name: "Motala Golfklubb",
    location: "Östergötland",
    rating: 4.1,
    difficulty: "Easy",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 58.5372,
    longitude: 15.0361
  },

  // Uppland
  {
    name: "Uppsala Golfklubb",
    location: "Uppland",
    rating: 4.5,
    difficulty: "Medium",
    holes: 18,
    price: "600 SEK",
    image: course1,
    latitude: 59.8586,
    longitude: 17.6389
  },
  {
    name: "Enköpings Golfklubb",
    location: "Uppland",
    rating: 4.2,
    difficulty: "Easy",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 59.6356,
    longitude: 17.0778
  },
  {
    name: "Sigtuna Golfklubb",
    location: "Uppland",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "550 SEK",
    image: course1,
    latitude: 59.6172,
    longitude: 17.7228
  },

  // Värmland
  {
    name: "Karlstads Golfklubb",
    location: "Värmland",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 59.3793,
    longitude: 13.5036
  },
  {
    name: "Kristinehamns Golfklubb",
    location: "Värmland",
    rating: 4.1,
    difficulty: "Easy",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 59.3097,
    longitude: 14.1083
  },
  {
    name: "Arvika Golfklubb",
    location: "Värmland",
    rating: 4.0,
    difficulty: "Easy",
    holes: 18,
    price: "420 SEK",
    image: course1,
    latitude: 59.6556,
    longitude: 12.5906
  },

  // Blekinge
  {
    name: "Karlskrona Golfklubb",
    location: "Blekinge",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 56.1612,
    longitude: 15.5869
  },
  {
    name: "Ronneby Golfklubb",
    location: "Blekinge",
    rating: 4.2,
    difficulty: "Easy",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 56.2097,
    longitude: 15.2750
  },

  // Gotland
  {
    name: "Visby Golfklubb",
    location: "Gotland",
    rating: 4.4,
    difficulty: "Medium",
    holes: 18,
    price: "550 SEK",
    image: course1,
    latitude: 57.6348,
    longitude: 18.2958
  },
  {
    name: "Kronholmens Golfklubb",
    location: "Gotland",
    rating: 4.2,
    difficulty: "Easy",
    holes: 9,
    price: "350 SEK",
    image: course1,
    latitude: 57.6500,
    longitude: 18.3000
  },

  // Gävleborg
  {
    name: "Gävle Golfklubb",
    location: "Gävleborg",
    rating: 4.2,
    difficulty: "Medium",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 60.6749,
    longitude: 17.1413
  },
  {
    name: "Sandvikens Golfklubb",
    location: "Gävleborg",
    rating: 4.1,
    difficulty: "Easy",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 60.6189,
    longitude: 16.7694
  },
  {
    name: "Bollnäs Golfklubb",
    location: "Gävleborg",
    rating: 4.0,
    difficulty: "Easy",
    holes: 18,
    price: "420 SEK",
    image: course1,
    latitude: 61.3497,
    longitude: 16.3925
  },

  // Västernorrland
  {
    name: "Sundsvalls Golfklubb",
    location: "Västernorrland",
    rating: 4.2,
    difficulty: "Medium",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 62.3908,
    longitude: 17.3069
  },
  {
    name: "Härnösands Golfklubb",
    location: "Västernorrland",
    rating: 4.0,
    difficulty: "Easy",
    holes: 18,
    price: "420 SEK",
    image: course1,
    latitude: 62.6322,
    longitude: 17.9378
  },
  {
    name: "Örnsköldsviks Golfklubb",
    location: "Västernorrland",
    rating: 4.1,
    difficulty: "Medium",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 63.2909,
    longitude: 18.7156
  },

  // Jämtland
  {
    name: "Östersunds Golfklubb",
    location: "Jämtland",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 63.1792,
    longitude: 14.6357
  },
  {
    name: "Åre Golfklubb",
    location: "Jämtland",
    rating: 4.5,
    difficulty: "Hard",
    holes: 18,
    price: "600 SEK",
    image: course1,
    latitude: 63.3981,
    longitude: 13.0814
  },

  // Västerbotten
  {
    name: "Umeå Golfklubb",
    location: "Västerbotten",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "500 SEK",
    image: course1,
    latitude: 63.8258,
    longitude: 20.2630
  },
  {
    name: "Skellefteå Golfklubb",
    location: "Västerbotten",
    rating: 4.1,
    difficulty: "Easy",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 64.7507,
    longitude: 20.9525
  },

  // Norrbotten
  {
    name: "Luleå Golfklubb",
    location: "Norrbotten",
    rating: 4.2,
    difficulty: "Medium",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 65.5841,
    longitude: 22.1546
  },
  {
    name: "Kiruna Golfklubb",
    location: "Norrbotten",
    rating: 4.0,
    difficulty: "Easy",
    holes: 9,
    price: "350 SEK",
    image: course1,
    latitude: 67.8558,
    longitude: 20.2253
  },
  {
    name: "Boden Golfklubb",
    location: "Norrbotten",
    rating: 4.1,
    difficulty: "Medium",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 65.8250,
    longitude: 21.6889
  },

  // Örebro
  {
    name: "Örebro Golfklubb",
    location: "Örebro",
    rating: 4.3,
    difficulty: "Medium",
    holes: 18,
    price: "520 SEK",
    image: course1,
    latitude: 59.2753,
    longitude: 15.2134
  },
  {
    name: "Karlskoga Golfklubb",
    location: "Örebro",
    rating: 4.2,
    difficulty: "Easy",
    holes: 18,
    price: "480 SEK",
    image: course1,
    latitude: 59.3267,
    longitude: 14.5217
  },
  {
    name: "Wittsjö Golfklubb",
    location: "Skåne",
    rating: 4.2,
    difficulty: "Medium",
    holes: 18,
    price: "450 SEK",
    image: course1,
    latitude: 56.1045,
    longitude: 13.3333
  }
];