import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import { PlayerProvider } from "@/lib/playerContext";
import { Toaster } from "@/components/ui/toaster";

import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import AdminLayout from "@/components/AdminLayout";
import ScrollToTop from "@/components/ScrollToTop";

import Home from "@/pages/Home";
import Manifesto from "@/pages/Manifesto";
import Bands from "@/pages/Bands";
import BandDetail from "@/pages/BandDetail";
import BandRegister from "@/pages/BandRegister";
import Shows from "@/pages/Shows";
import Venues from "@/pages/Venues";
import VenueDetail from "@/pages/VenueDetail";
import Partners from "@/pages/Partners";
import News from "@/pages/News";
import Threads from "@/pages/Threads";
import ThreadDetail from "@/pages/ThreadDetail";
import Contact from "@/pages/Contact";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import PageNotFound from "@/lib/PageNotFound";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminBands from "@/pages/admin/AdminBands";
import AdminBandEdit from "@/pages/admin/AdminBandEdit";
import AdminShows from "@/pages/admin/AdminShows";
import AdminShowEdit from "@/pages/admin/AdminShowEdit";
import AdminVenues from "@/pages/admin/AdminVenues";
import AdminVenueEdit from "@/pages/admin/AdminVenueEdit";
import AdminPartners from "@/pages/admin/AdminPartners";
import AdminPartnerEdit from "@/pages/admin/AdminPartnerEdit";
import AdminThreads from "@/pages/admin/AdminThreads";
import AdminNews from "@/pages/admin/AdminNews";
import AdminNewsEdit from "@/pages/admin/AdminNewsEdit";
import AdminBanners from "@/pages/admin/AdminBanners";
import AdminVenueReviews from "@/pages/admin/AdminVenueReviews";
import AdminContactMessages from "@/pages/admin/AdminContactMessages";

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <PlayerProvider>
          <ScrollToTop />
          <Routes>
            {/* Rotas Públicas com Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/manifesto" element={<Manifesto />} />
              <Route path="/bands" element={<Bands />} />
              <Route path="/bands/:slug" element={<BandDetail />} />
              <Route path="/shows" element={<Shows />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/venues/:id" element={<VenueDetail />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/news" element={<News />} />
              <Route path="/threads" element={<Threads />} />
              <Route path="/threads/:id" element={<ThreadDetail />} />
              <Route path="/contact" element={<Contact />} />

              {/* Rotas Protegidas */}
              <Route
                path="/my-band"
                element={
                  <ProtectedRoute>
                    <BandRegister />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Rota direta para Slug da Banda (ex: /midgard) */}
              <Route path="/:slug" element={<BandDetail />} />
            </Route>

            {/* Rotas de Administração */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="bands" element={<AdminBands />} />
              <Route path="bands/:id" element={<AdminBandEdit />} />
              <Route path="shows" element={<AdminShows />} />
              <Route path="shows/:id" element={<AdminShowEdit />} />
              <Route path="venues" element={<AdminVenues />} />
              <Route path="venues/:id" element={<AdminVenueEdit />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="partners/:id" element={<AdminPartnerEdit />} />
              <Route path="threads" element={<AdminThreads />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="news/:id" element={<AdminNewsEdit />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="venue-reviews" element={<AdminVenueReviews />} />
              <Route path="contact-messages" element={<AdminContactMessages />} />
            </Route>

            {/* Rotas de Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Página Não Encontrada */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Toaster />
        </PlayerProvider>
      </Router>
    </AuthProvider>
  );
}