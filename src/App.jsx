import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Listings from './pages/Listings.jsx'
import PropertyDetail from './pages/PropertyDetail.jsx'
import ViewingRequest from './pages/ViewingRequest.jsx'
import Saved from './pages/Saved.jsx'
import Calculator from './pages/Calculator.jsx'
import About from './pages/About.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="properties" element={<Listings />} />
        <Route path="properties/:slug" element={<PropertyDetail />} />
        <Route path="properties/:slug/viewing" element={<ViewingRequest />} />
        <Route path="saved" element={<Saved />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
