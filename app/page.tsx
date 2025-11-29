"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Facebook, Linkedin, Instagram, Home, Mail, Phone, ArrowRight, Check } from "lucide-react";

export default function RevEarthPage() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [lawModalOpen, setLawModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    document.querySelectorAll(".fade-in-section").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white font-gotham overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3 group">
              <div className="transition-transform duration-300 group-hover:scale-110">
                <Image src="/assets/logo2.png" alt="Logo" width={44} height={44} />
              </div>
              <Link href="/" className="text-2xl font-gilroy-bold text-revearth-dark">
                RevEarth
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              <Button asChild variant="ghost" className="text-sm font-medium hover:text-revearth-dark">
                <Link href="#offers">HOME</Link>
              </Button>
              <Button asChild variant="ghost" className="text-sm font-medium hover:text-revearth-dark">
                <Link href="#customersbenefit">SERVICES</Link>
              </Button>
              <Button asChild variant="ghost" className="text-sm font-medium hover:text-revearth-dark">
                <Link href="#RevEarth">ABOUT</Link>
              </Button>
              <Button
                asChild
                className="ml-4 bg-revearth-dark hover:bg-revearth-dark/90 text-white rounded-full px-6 py-2.5 transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <Link href="/auth/signin">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign up Modal */}
      <Dialog open={signupOpen} onOpenChange={setSignupOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center space-x-4">
              <Image src="/assets/logo2.png" alt="" width={50} height={50} />
              <DialogTitle className="text-2xl text-revearth-dark font-gilroy-bold">
                REGISTRATION
              </DialogTitle>
            </div>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullname">Full Name</Label>
                <Input type="text" placeholder="Enter your Firstname" />
              </div>
              <div>
                <Input
                  type="text"
                  placeholder="Enter your Lastname"
                  className="mt-6"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input type="text" placeholder="Enter Username" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input type="tel" placeholder="Enter Phone Number" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" placeholder="Enter Email" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input type="password" placeholder="Enter Password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input type="password" placeholder="Enter Confirm Password" />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-revearth-dark hover:bg-revearth-green/70"
            >
              Sign Up
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setSignupOpen(false);
                  window.location.href = "/auth/signin";
                }}
                className="text-revearth-dark hover:underline"
              >
                Log In
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/rever.jpg"
            alt="Philippine Image"
            fill
            className="object-cover brightness-75"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
        </div>

        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-gilroy-bold mb-6 tracking-tight leading-tight animate-fade-in-up">
            Unravel your Trace
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto font-light animate-fade-in-up animation-delay-200">
            Web-based tool for energy auditing and greenhouse gas emission calculation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
            <Button
              asChild
              size="lg"
              className="bg-white text-revearth-dark hover:bg-white/90 rounded-full px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <Link href="/auth/signin">
                Start Your Journey <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full px-8 py-6 text-lg font-medium transition-all duration-300"
            >
              <Link href="#customersbenefit">Learn More</Link>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      <main>
        {/* What We Do Section */}
        <section id="offer" className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-20 fade-in-section">
              <h2 className="text-5xl md:text-6xl font-gilroy-bold text-revearth-dark mb-4 tracking-tight">
                What We Do
              </h2>
              <div className="w-24 h-1.5 bg-revearth-green mx-auto rounded-full" />
            </div>

            <div className="space-y-32">
              {/* GHG Emission Inventory */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center fade-in-section">
                <div className="order-2 lg:order-1 group">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 hover:shadow-3xl">
                    <Image
                      src="/assets/reve.jpg"
                      alt="GHG Emission"
                      width={600}
                      height={450}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-revearth-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <h3 className="text-4xl md:text-5xl font-gilroy-bold text-revearth-dark leading-tight">
                    GHG Emission Inventory
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    GHG emission inventory quantifies the emitted GHG in a
                    certain period of time. It tracks the sources of the
                    emission, assesses the carbon footprint, and monitors the
                    progress of the reduction target. GHG emissions can be
                    calculated through different sectors like the energy sector
                    which calculates the emission from energy produced and
                    consumed, and the transportation sector which calculates the
                    emission from vehicles used.
                  </p>
                </div>
              </div>

              {/* Energy Auditing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center fade-in-section">
                <div className="space-y-6">
                  <h3 className="text-4xl md:text-5xl font-gilroy-bold text-revearth-dark leading-tight">
                    Energy Auditing
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Energy auditing evaluates the efficiency of a building or
                    faculty by assessing its energy consumption and
                    consumption pattern. It provides solution and
                    recommendations based on the analyzed data. Energy
                    auditing contributes to energy conservation,
                    cost-effectiveness, and energy management plan of the
                    building or facility.
                  </p>
                </div>
                <div className="group">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 hover:shadow-3xl">
                    <Image
                      src="/assets/img3.jpg"
                      alt="Energy Auditing"
                      width={600}
                      height={450}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-revearth-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              </div>

              {/* RA 11285 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center fade-in-section">
                <div className="order-2 lg:order-1 group">
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-700 hover:shadow-3xl">
                    <Image
                      src="/assets/img2.jpg"
                      alt="RA 11285"
                      width={600}
                      height={450}
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-revearth-dark/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                  <h3 className="text-4xl md:text-5xl font-gilroy-bold text-revearth-dark leading-tight">
                    RA 11285
                  </h3>
                  <h4 className="text-2xl font-gilroy text-revearth-green">
                    Energy Efficiency and Conservation Act
                  </h4>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    The Energy Efficient and Conservation Act makes energy
                    conservation essential and institutionalizes in order to
                    ensure that energy use becomes sustainable.
                  </p>
                  <Dialog open={lawModalOpen} onOpenChange={setLawModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-revearth-dark text-white hover:bg-revearth-dark/90 rounded-full px-8 py-3 text-base font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 group">
                        Learn More
                        <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-gilroy-bold text-revearth-dark text-center">
                          Energy Efficient and Conservation Act
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div className="flex justify-center">
                          <Image
                            src="/assets/reve.jpg"
                            alt="Law"
                            width={300}
                            height={400}
                            className="rounded-2xl object-cover shadow-xl"
                          />
                        </div>
                        <div className="space-y-4 text-base text-gray-600 leading-relaxed">
                          <p>
                            Republic Act No. 11285, the Energy Efficient and
                            Conservation Act, outlines its policy in Section 2.
                            This declaration commits to institutionalizing
                            energy efficiency and conservation practices,
                            emphasizing their integration into established
                            institutions and systems.
                          </p>
                          <p>
                            Furthermore, the act seeks to actively promote and
                            encourage the development of efficient renewable
                            technologies, recognizing the crucial role they play
                            in sustainable energy practices. Additionally, it
                            aims to reinforce existing laws, ensuring a
                            comprehensive approach to energy efficiency and
                            conservation.
                          </p>
                          <p>
                            Finally, the act advocates for a market-driven
                            approach, highlighting the importance of economic
                            mechanisms in fostering effective energy efficiency
                            and conservation initiatives. Section 2 establishes
                            the framework for a strategic and well-coordinated
                            approach to energy management, highlighting the
                            government&apos;s unwavering dedication to cultivating a
                            resilient and sustainable energy future for the
                            Philippines.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Benefits */}
        <section id="customersbenefit" className="py-24 md:py-32 bg-gradient-to-br from-revearth-green/20 via-revearth-green/10 to-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-20 fade-in-section">
              <h2 className="text-5xl md:text-6xl font-gilroy-bold text-revearth-dark mb-4 tracking-tight">
                Customer Benefits
              </h2>
              <div className="w-24 h-1.5 bg-revearth-green mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: "/assets/cb_icon1.png",
                  title: "Energy and GHG Emissions Monitoring",
                },
                {
                  icon: "/assets/cb_icon2.png",
                  title: "Management and Reduction Opportunities",
                },
                {
                  icon: "/assets/cb_icon3.png",
                  title: "Capture Financial Returns from Energy Savings",
                },
                {
                  icon: "/assets/cb_icon4.png",
                  title: "Reduce Environmental Impact",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="group fade-in-section text-center p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="mb-6 transition-transform duration-500 group-hover:scale-110">
                    <Image
                      src={benefit.icon}
                      alt=""
                      width={100}
                      height={100}
                      className="mx-auto"
                    />
                  </div>
                  <p className="font-gilroy-bold text-base text-revearth-dark">
                    {benefit.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About RevEarth */}
        <section id="RevEarth" className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24 fade-in-section">
              <div className="flex justify-center group">
                <div className="relative">
                  <div className="absolute inset-0 bg-revearth-green rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                  <Image
                    src="/assets/rev.jpg"
                    alt="RevEarth"
                    width={500}
                    height={500}
                    className="relative rounded-full object-cover shadow-2xl transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              </div>
              <div className="text-center lg:text-left space-y-6">
                <h1 className="text-6xl md:text-7xl mb-6 leading-none">
                  <span className="text-revearth-green font-gilroy-bold">
                    Rev
                  </span>
                  <span className="text-revearth-dark font-gilroy-bold">
                    EARTH
                  </span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed">
                  revEARTH is a startup company in the province of Bataan
                  offering a web-based tool for energy auditing and greenhouse
                  gas emission calculation for institutions and small-to-medium
                  enterprises – providing them with energy management solutions
                  and cost-cutting strategies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              <div className="fade-in-section p-10 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <h3 className="text-3xl font-gilroy-bold text-revearth-dark mb-6 text-center">
                  Mission
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  revEARTH provides a user-friendly tool for energy
                  consumption and GHG emissions calculation to institutions
                  and small-to-medium enterprises in the province of Bataan,
                  and empower them with effective and sustainable energy
                  management plans by providing them with the necessary
                  information regarding their energy usage and GHG emissions.
                </p>
              </div>

              <div className="fade-in-section p-10 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <h3 className="text-3xl font-gilroy-bold text-revearth-dark mb-6 text-center">
                  Vision
                </h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  revEARTH aims to contribute to the total reduction of the
                  Philippine carbon footprint within the industry and
                  transport sector and its environmental impacts, as well as
                  to promote a more sustainable, efficient, and responsible
                  energy consumption in line with the Energy Efficiency and
                  Conservation Act of the Philippines.
                </p>
              </div>
            </div>

            <div className="text-center fade-in-section">
              <h2 className="text-5xl md:text-6xl font-gilroy-bold text-revearth-green/80 italic">
                &quot;Unravel your Trace&quot;
              </h2>
            </div>
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="py-24 md:py-32 bg-gradient-to-br from-revearth-green via-revearth-green-light to-revearth-green">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-20 fade-in-section">
              <h2 className="text-5xl md:text-6xl font-gilroy-bold text-revearth-dark mb-4 tracking-tight">
                Subscription Plans
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Take your desired plan to get access to our service easily, we
                like to offer special license offer our users.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  title: "BASIC",
                  features: [
                    "Energy Auditing",
                    "Total Kg of Co2e",
                    "Individual Equipment Consumption",
                    "GHG Inventory",
                    "Equipment Emissions",
                    "Energy Analysis",
                  ],
                },
                {
                  title: "STANDARD",
                  features: [
                    "Energy Auditing",
                    "Total Kg of Co2e",
                    "Individual Equipment Consumption",
                    "GHG Inventory",
                    "Equipment Emissions",
                    "Cost Cutting Strategy",
                    "Energy Analysis",
                    "Decomposition Analysis",
                  ],
                  popular: true,
                },
                {
                  title: "PREMIUM",
                  features: [
                    "Energy Auditing",
                    "Total Kg of Co2e",
                    "Individual Equipment Consumption",
                    "GHG Inventory",
                    "Equipment Emissions",
                    "Transportation Emissions",
                    "Energy Management Plan",
                    "Cost Cutting Strategy",
                    "Energy Analysis",
                    "Decomposition Analysis",
                    "Site Visit",
                  ],
                },
              ].map((plan, index) => (
                <div
                  key={index}
                  className={`fade-in-section relative bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-3xl ${
                    plan.popular ? "ring-4 ring-revearth-dark scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-revearth-dark text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">
                      POPULAR
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-3xl font-gilroy-bold text-revearth-dark mb-8 text-center">
                      {plan.title}
                    </h3>
                    <div className="space-y-4 mb-8 min-h-[320px]">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-revearth-green flex-shrink-0 mt-0.5" />
                          <span
                            className={
                              feature.includes("Energy Auditing") ||
                              feature.includes("GHG Inventory")
                                ? "font-gilroy-bold text-sm text-revearth-dark"
                                : "text-sm text-gray-600"
                            }
                          >
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-revearth-dark text-white hover:bg-revearth-dark/90 rounded-full py-6 text-base font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                      GET STARTED
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership */}
        <section id="partnership" className="py-24 md:py-32 bg-white">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center fade-in-section">
              <h2 className="text-3xl font-gilroy-bold text-gray-800 mb-12">
                INCUBATED BY
              </h2>
              <div className="max-w-md mx-auto p-12 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                <Image
                  src="/assets/NEXUS.png"
                  alt="New Energy Nexus"
                  width={120}
                  height={120}
                  className="mx-auto mb-6"
                />
                <h5 className="text-xl font-gilroy-bold text-gray-900">
                  NEW ENERGY NEXUS PHILIPPINES
                </h5>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        {/* Social Media Section */}
        <section className="bg-revearth-dark py-8">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-white">
              <h6 className="mb-6 md:mb-0 text-lg font-medium">
                Get connected with us on social networks:
              </h6>
              <div className="flex space-x-6">
                <Link
                  href="#"
                  className="text-white hover:text-revearth-green transition-all duration-300 hover:scale-110"
                >
                  <Facebook size={28} />
                </Link>
                <Link
                  href="#"
                  className="text-white hover:text-revearth-green transition-all duration-300 hover:scale-110"
                >
                  <Linkedin size={28} />
                </Link>
                <Link
                  href="#"
                  className="text-white hover:text-revearth-green transition-all duration-300 hover:scale-110"
                >
                  <Instagram size={28} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Footer */}
        <section id="contacts" className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="text-center md:text-left">
                <Link href="#home">
                  <Image
                    src="/assets/logo.png"
                    alt="RevEarth Logo"
                    width={150}
                    height={150}
                    className="mx-auto md:mx-0 transition-transform duration-300 hover:scale-105"
                  />
                </Link>
              </div>

              <div className="space-y-4">
                <h5 className="font-gilroy-bold text-lg mb-4">
                  <Link
                    href="#home"
                    className="text-gray-900 hover:text-revearth-green transition-colors duration-300"
                  >
                    Home
                  </Link>
                </h5>
                <h5 className="font-gilroy-bold text-lg">
                  <Link
                    href="#service"
                    className="text-gray-900 hover:text-revearth-green transition-colors duration-300"
                  >
                    Service
                  </Link>
                </h5>
              </div>

              <div>
                <h5 className="font-gilroy-bold text-lg mb-4">
                  <Link
                    href="#about"
                    className="text-gray-900 hover:text-revearth-green transition-colors duration-300"
                  >
                    About
                  </Link>
                </h5>
                <div className="space-y-3 text-sm">
                  <div>
                    <Link
                      href="#about"
                      className="text-gray-700 hover:text-revearth-green transition-colors duration-300"
                    >
                      What we do
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#customersbenefit"
                      className="text-gray-700 hover:text-revearth-green transition-colors duration-300"
                    >
                      Customer&apos;s benefit
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#RevEarth"
                      className="text-gray-700 hover:text-revearth-green transition-colors duration-300"
                    >
                      About RevEARTH
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#team"
                      className="text-gray-700 hover:text-revearth-green transition-colors duration-300"
                    >
                      Our Team
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#partnership"
                      className="text-gray-700 hover:text-revearth-green transition-colors duration-300"
                    >
                      Partnership
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-700 hover:text-revearth-green transition-colors duration-300">
                  <Home size={18} className="flex-shrink-0" />
                  <span className="text-sm">Balanga City, Bataan</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-revearth-green transition-colors duration-300">
                  <Mail size={18} className="flex-shrink-0" />
                  <span className="text-sm">revearth@gmail.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700 hover:text-revearth-green transition-colors duration-300">
                  <Phone size={18} className="flex-shrink-0" />
                  <span className="text-sm">+ 01 234 567 88</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .fade-in-section {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .fade-in-section.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
