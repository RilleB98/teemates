import { Hero } from "@/components/Hero";
import { Navigation } from "@/components/Navigation";
import { PlayerCard } from "@/components/PlayerCard";
import { CourseCard } from "@/components/CourseCard";
import player1 from "@/assets/player1.jpg";
import course1 from "@/assets/course1.jpg";

const Index = () => {
  const samplePlayers = [
    {
      name: "Marcus",
      age: 28,
      handicap: 12,
      location: "Stockholm",
      favoritesCourse: "Bro Hof Slott Golf Club",
      profileImage: player1,
      rating: 4.8,
      achievements: ["Club Champion", "Eagles Club"]
    },
    {
      name: "Emma",
      age: 32,
      handicap: 8,
      location: "Göteborg", 
      favoritesCourse: "Hills Golf Club",
      profileImage: player1,
      rating: 4.9,
      achievements: ["Tournament Winner", "Hole in One"]
    },
    {
      name: "Johan",
      age: 25,
      handicap: 15,
      location: "Malmö",
      favoritesCourse: "Malmö Burlöv Golf Club", 
      profileImage: player1,
      rating: 4.7,
      achievements: ["Beginner's Luck", "Most Improved"]
    }
  ];

  const sampleCourses = [
    {
      name: "Bro Hof Slott Golf Club",
      location: "Stockholm",
      rating: 4.9,
      difficulty: "Hard",
      holes: 18,
      price: "950 SEK",
      image: course1,
      activeUsers: 24
    },
    {
      name: "Hills Golf Club", 
      location: "Göteborg",
      rating: 4.7,
      difficulty: "Medium",
      holes: 18,
      price: "750 SEK",
      image: course1,
      activeUsers: 18
    },
    {
      name: "Malmö Burlöv Golf Club",
      location: "Malmö", 
      rating: 4.6,
      difficulty: "Easy",
      holes: 18,
      price: "650 SEK",
      image: course1,
      activeUsers: 12
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Players Section */}
      <section className="py-20 px-6 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-golf-premium mb-6">
              Meet Fellow Golfers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with passionate golfers in your area and discover your perfect playing partners
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samplePlayers.map((player, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                <PlayerCard {...player} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Courses Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-golf-premium mb-6">
              Discover Amazing Courses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore the best golf courses and book your next round with fellow players
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sampleCourses.map((course, index) => (
              <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                <CourseCard {...course} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-golf">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-slide-up">
            Ready to Tee Off?
          </h2>
          <p className="text-xl text-white/90 mb-8 animate-slide-up">
            Join thousands of golfers already making connections and improving their game
          </p>
          <div className="animate-slide-up">
            <button className="bg-white text-golf-green px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/90 transition-smooth shadow-premium">
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
