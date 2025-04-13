// src/pages/home/HomePage.tsx
import { Link } from 'react-router-dom';
import { Calendar, VideoIcon, Home, Search, Star, HeartPulse, Shield } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../../providers/AuthProvider';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  // Sample featured doctors
  const featuredDoctors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      rating: 4.9,
      reviews: 124,
      image: 'https://randomuser.me/api/portraits/women/75.jpg',
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      rating: 4.8,
      reviews: 98,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrician',
      rating: 4.9,
      reviews: 156,
      image: 'https://randomuser.me/api/portraits/women/43.jpg',
    },
    {
      id: '4',
      name: 'Dr. James Wilson',
      specialty: 'Neurologist',
      rating: 4.7,
      reviews: 87,
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/90 to-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Your Health, Our Priority
              </h1>
              <p className="text-lg mb-8 text-white/90">
                Connect with top doctors for in-person visits, video consultations, or home
                appointments. Quality healthcare is just a few clicks away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/doctors">
                  <Button size="lg" variant="secondary">
                    <Search className="mr-2 h-5 w-5" />
                    Find a Doctor
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
                    >
                      Sign Up Now
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <img
                src="/hero-image.svg"
                alt="Doctor with patient"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from multiple appointment types to fit your healthcare needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>In-Clinic Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 min-h-[80px]">
                  Schedule face-to-face appointments with doctors at their clinic locations for
                  personalized care.
                </CardDescription>
                <Link to="/doctors">
                  <Button variant="outline" className="mt-4">
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <VideoIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Video Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 min-h-[80px]">
                  Connect with healthcare professionals through secure video calls from the comfort
                  of your home.
                </CardDescription>
                <Link to="/doctors">
                  <Button variant="outline" className="mt-4">
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Home Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 min-h-[80px]">
                  Have doctors come to your doorstep for convenient and private medical care at
                  home.
                </CardDescription>
                <Link to="/doctors">
                  <Button variant="outline" className="mt-4">
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Doctors</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform hosts top medical professionals across various specialties
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredDoctors.map(doctor => (
              <Link to={`/doctors/${doctor.id}`} key={doctor.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="rounded-full w-24 h-24 object-cover"
                      />
                    </div>
                    <CardTitle>{doctor.name}</CardTitle>
                    <CardDescription>{doctor.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 font-medium">{doctor.rating}</span>
                      <span className="ml-1 text-gray-500">({doctor.reviews} reviews)</span>
                    </div>
                    <Button variant="outline" className="mt-2">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/doctors">
              <Button>View All Doctors</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose MediConnect</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing you with the best healthcare experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <HeartPulse className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Care</h3>
              <p className="text-gray-600">
                Our platform hosts verified, top-tier healthcare professionals committed to
                providing excellent care.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Scheduling</h3>
              <p className="text-gray-600">
                Book appointments at your convenience through our user-friendly platform, 24/7.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Platform</h3>
              <p className="text-gray-600">
                Your health information and consultations are protected with industry-leading
                security measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your health?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of patients who've simplified their healthcare journey with MediConnect
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/doctors">
              <Button size="lg" variant="secondary">
                Find a Doctor
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
                >
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
