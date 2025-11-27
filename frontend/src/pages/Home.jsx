import { Link } from "react-router-dom"
import { useAuthStore } from "../store/authStore"
import { FiUsers, FiCalendar, FiImage, FiGitBranch, FiArrowRight } from "react-icons/fi"

export default function Home() {
  const { isAuthenticated, user } = useAuthStore()

  const features = [
    {
      icon: FiUsers,
      title: "Member Directory",
      description: "Connect with all community members and view their profiles.",
      link: "/members",
    },
    {
      icon: FiGitBranch,
      title: "Family Trees",
      description: "Create and explore family trees to understand relationships.",
      link: "/family-trees",
    },
    {
      icon: FiImage,
      title: "Community Feed",
      description: "Share moments and stay updated with community posts.",
      link: "/feed",
    },
    {
      icon: FiCalendar,
      title: "Events",
      description: "Discover and register for upcoming community events.",
      link: "/events",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Welcome to Gajjar Samaj</h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            A digital platform to connect, share, and celebrate our community heritage. Build family trees, share
            moments, and stay connected.
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Join Our Community
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Member Login
              </Link>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-md mx-auto">
              <p className="text-primary-100 mb-2">Welcome back,</p>
              <p className="text-2xl font-bold">
                {user?.firstName} {user?.lastName}
              </p>
              {!user?.isApproved && (
                <p className="mt-3 text-yellow-200 text-sm">Your account is pending approval from admin.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={isAuthenticated ? feature.link : "/login"}
                className="card p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <span className="text-primary-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <FiArrowRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary-600">500+</p>
              <p className="text-gray-600 mt-1">Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">100+</p>
              <p className="text-gray-600 mt-1">Family Trees</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">50+</p>
              <p className="text-gray-600 mt-1">Events</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary-600">1000+</p>
              <p className="text-gray-600 mt-1">Posts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Gajjar Samaj</h3>
          <p className="text-gray-400 mb-6">Connecting generations, preserving heritage.</p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Gajjar Samaj Community. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
