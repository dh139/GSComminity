export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-6">
            <span className="text-3xl font-bold text-white">GS</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Gajjar Samaj Community App</h1>
          <p className="text-xl text-gray-600">A full MERN stack application built with Vite + React</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-left">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">This is a Vite + React App</h2>
          <p className="text-gray-600 mb-6">
            This application is designed to run locally with a Node.js backend and MongoDB database. It cannot be
            previewed in v0's browser environment.
          </p>

          <h3 className="font-semibold text-gray-800 mb-3">To run this app:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
            <li>Download the project files (click the three dots → Download ZIP)</li>
            <li>Set up MongoDB locally or use MongoDB Atlas</li>
            <li>Create a Cloudinary account for image uploads</li>
            <li>Configure the .env file with your credentials</li>
            <li>
              Run <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> in both backend and frontend
              folders
            </li>
          </ol>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-orange-800 text-sm">
              <strong>Note:</strong> Check the README.md file for detailed setup instructions, including all required
              environment variables and API endpoints.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold text-gray-800">Frontend</div>
            <div className="text-gray-500">Vite + React</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold text-gray-800">Backend</div>
            <div className="text-gray-500">Express.js</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold text-gray-800">Database</div>
            <div className="text-gray-500">MongoDB</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="font-semibold text-gray-800">Storage</div>
            <div className="text-gray-500">Cloudinary</div>
          </div>
        </div>
      </div>
    </div>
  )
}
