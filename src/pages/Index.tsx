import { Navigation } from "@/components/Navigation";
import { PlayerCard } from "@/components/PlayerCard";
import { CourseCard } from "@/components/CourseCard";
import { ChatRoom } from "@/components/ChatRoom";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNearbyProfiles } from "@/hooks/useNearbyProfiles";
import { useAuth } from "@/hooks/useAuth";
import player1 from "@/assets/player1.jpg";
import course1 from "@/assets/course1.jpg";

const Index = () => {
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();
  const { profiles, loading, userCity } = useNearbyProfiles();

  const samplePlayers = [
    {
      name: "Ahmed",
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

  if (showChat) {
    return <ChatRoom onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onMessagesClick={() => setShowChat(true)} />
      
      {/* Players Section */}
      <section className="py-20 px-6 bg-gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-golf-premium mb-6">
              {user && userCity ? `Golfare från ${userCity}` : 'Meet Fellow Golfers'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {user && userCity 
                ? `Träffa andra golfare som också bor i ${userCity}` 
                : 'Connect with passionate golfers in your area and discover your perfect playing partners'}
            </p>
          </div>
          
          {user ? (
            loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-lg text-muted-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                  Laddar profiler...
                </div>
              </div>
            ) : profiles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {profiles.map((profile, index) => (
                  <div key={profile.user_id} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                    <PlayerCard 
                      name={profile.name}
                      age={profile.age}
                      handicap={profile.handicap}
                      location={profile.home_city}
                      favoritesCourse={profile.home_club || 'Ingen klubb vald'}
                      profileImage={profile.avatar_url || player1}
                      rating={4.5}
                      achievements={['Medlem']}
                    />
                  </div>
                ))}
              </div>
            ) : userCity ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  Inga andra golfare från {userCity} hittades än. 
                </p>
                <p className="text-muted-foreground mt-2">
                  Kom tillbaka senare för att se nya medlemmar!
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  <Link to="/profile" className="text-primary hover:underline">
                    Välj din hemmastad i profilen
                  </Link> för att se golfare från din stad!
                </p>
              </div>
            )
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {samplePlayers.map((player, index) => (
                <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                  <PlayerCard {...player} />
                </div>
              ))}
            </div>
          )}
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
            <Link to="/auth">
              <button className="bg-white text-golf-green px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/90 transition-smooth shadow-premium">
                Kom igång idag
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
