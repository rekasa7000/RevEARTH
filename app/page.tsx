"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Facebook, Linkedin, Instagram, Home, Mail, Phone } from "lucide-react";

export default function RevEarthPage() {
  const [signupOpen, setSignupOpen] = useState(false);
  const [lawModalOpen, setLawModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-gotham overflow-x-hidden">
      <nav className="border-b bg-background fixed top-0 right-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Image src="/assets/logo2.png" alt="Logo" width={40} height={40} />
              <Link href="/" className="text-xl font-bold pl-3.5">
                RevEarth
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="#offers">HOME</Link>
                </Button>

                <Button asChild variant="ghost">
                  <Link href="#customersbenefit">SERVICES</Link>
                </Button>

                <Button asChild variant="ghost">
                  <Link href="/auth/signin">ABOUT</Link>
                </Button>

                <Button asChild>
                  <Link href="/auth/signin">Get Started</Link>
                </Button>
              </div>
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

      {/* Hero Image */}
      <div className="relative -mt-20 pt-20">
        <Image
          src="/assets/rever.jpg"
          alt="Philippine Image"
          width={1920}
          height={800}
          className="w-full h-[400px] md:h-[600px] object-cover"
        />
      </div>

      <main>
        {/* What We Do Section */}
        <section id="offer" className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-16">
              {/* GHG Emission Inventory */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="order-2 lg:order-1">
                  <Image
                    src="/assets/reve.jpg"
                    alt="GHG Emission"
                    width={500}
                    height={400}
                    className="rounded-3xl w-full h-64 object-cover"
                  />
                </div>
                <div className="order-1 lg:order-2 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-revearth-dark mb-4">
                    GHG EMISSION INVENTORY
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
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
              <div className="bg-gray-50 rounded-3xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-revearth-dark mb-4">
                      ENERGY AUDITING
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Energy auditing evaluates the efficiency of a building or
                      faculty by assessing its energy consumption and
                      consumption pattern. It provides solution and
                      recommendations based on the analyzed data. Energy
                      auditing contributes to energy conservation,
                      cost-effectiveness, and energy management plan of the
                      building or facility.
                    </p>
                  </div>
                  <div>
                    <Image
                      src="/assets/img3.jpg"
                      alt="Energy Auditing"
                      width={500}
                      height={400}
                      className="rounded-3xl w-full h-64 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* RA 11285 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="order-2 lg:order-1">
                  <Image
                    src="/assets/img2.jpg"
                    alt="RA 11285"
                    width={500}
                    height={400}
                    className="rounded-3xl w-full h-64 object-cover"
                  />
                </div>
                <div className="order-1 lg:order-2 text-center lg:text-left">
                  <h2 className="text-3xl font-bold text-revearth-dark mb-4">
                    RA 11285
                  </h2>
                  <h3 className="text-xl font-bold text-revearth-dark mb-4">
                    Energy Efficiency and Conservation Act
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    The Energy Efficient and Conservation Act makes energy
                    conservation essential and institutionalizes in order to
                    ensure that energy use becomes sustainable.
                  </p>
                  <Dialog open={lawModalOpen} onOpenChange={setLawModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-800 text-revearth-green hover:bg-revearth-green hover:text-gray-800 rounded-full px-6">
                        Learn More
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-revearth-dark text-center uppercase">
                          Energy Efficient and Conservation Act
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex justify-center">
                          <Image
                            src="/assets/reve.jpg"
                            alt="Law"
                            width={300}
                            height={400}
                            className="rounded-3xl object-cover"
                          />
                        </div>
                        <div className="space-y-4 text-sm">
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
        <section id="customersbenefit" className="py-16 bg-revearth-green/40">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-revearth-dark mb-12 uppercase">
              Customer&apos;s Benefit
            </h2>
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
                <Card
                  key={index}
                  className="text-center border-0 bg-transparent"
                >
                  <CardContent className="pt-6">
                    <Image
                      src={benefit.icon}
                      alt=""
                      width={100}
                      height={100}
                      className="mx-auto mb-4"
                    />
                    <p className="font-bold text-sm">{benefit.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About RevEarth */}
        <section id="RevEarth" className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div className="flex justify-center">
                <Image
                  src="/assets/rev.jpg"
                  alt="RevEarth"
                  width={400}
                  height={400}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="text-center lg:text-left">
                <h1 className="text-4xl mb-6">
                  <span className="text-revearth-green font-gilroy-bold">
                    Rev
                  </span>
                  <span className="text-revearth-dark font-gilroy-bold">
                    EARTH
                  </span>
                </h1>
                <p className="text-gray-700 leading-relaxed">
                  revEARTH is a startup company in the province of Bataan
                  offering a web-based tool for energy auditing and greenhouse
                  gas emission calculation for institutions and small-to-medium
                  enterprises – providing them with energy management solutions
                  and cost-cutting strategies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <Card className="text-center border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-revearth-dark uppercase">
                    Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    revEARTH provides a user-friendly tool for energy
                    consumption and GHG emissions calculation to institutions
                    and small-to-medium enterprises in the province of Bataan,
                    and empower them with effective and sustainable energy
                    management plans by providing them with the necessary
                    information regarding their energy usage and GHG emissions.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-revearth-dark uppercase">
                    Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    revEARTH aims to contribute to the total reduction of the
                    Philippine carbon footprint within the industry and
                    transport sector and its environmental impacts, as well as
                    to promote a more sustainable, efficient, and responsible
                    energy consumption in line with the Energy Efficiency and
                    Conservation Act of the Philippines.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-revearth-green/80">
                &quot;Unravel your Trace&quot;
              </h1>
            </div>
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="py-16 bg-revearth-green">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center text-revearth-dark mb-4 uppercase">
              Subscription Plan
            </h1>
            <p className="text-center text-gray-700 mb-12">
              Take your desired plan to get access to our service easily, we
              like to offer special license offer our users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                <Card key={index} className="bg-gray-50 h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-revearth-dark">
                      {plan.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <div className="space-y-3 flex-1">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex}>
                          {feature.includes("Energy Auditing") ||
                          feature.includes("GHG Inventory") ? (
                            <p className="font-bold text-sm">{feature}</p>
                          ) : (
                            <p className="text-sm text-gray-600">{feature}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button className="mt-6 bg-gray-800 text-revearth-green hover:bg-revearth-green hover:text-gray-800 rounded-full">
                      GET STARTED
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership */}
        <section id="partnership" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                INCUBATED BY
              </h2>
              <Card className="max-w-md mx-auto text-center border-0 bg-transparent">
                <CardContent className="pt-6">
                  <Image
                    src="/assets/NEXUS.png"
                    alt="New Energy Nexus"
                    width={100}
                    height={100}
                    className="mx-auto mb-4"
                  />
                  <h5 className="text-lg font-bold text-gray-900">
                    NEW ENERGY NEXUS PHILIPPINES
                  </h5>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        {/* Social Media Section */}
        <section className="bg-revearth-dark py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center text-white">
              <h6 className="mb-4 md:mb-0">
                Get connected with us on social networks:
              </h6>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="text-white hover:text-revearth-green transition-colors"
                >
                  <Facebook size={32} />
                </Link>
                <Link
                  href="#"
                  className="text-white hover:text-revearth-green transition-colors"
                >
                  <Linkedin size={32} />
                </Link>
                <Link
                  href="#"
                  className="text-white hover:text-revearth-green transition-colors"
                >
                  <Instagram size={32} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Footer */}
        <section id="contacts" className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center md:text-left">
                <Link href="#home">
                  <Image
                    src="/assets/logo.png"
                    alt="RevEarth Logo"
                    width={150}
                    height={150}
                    className="mx-auto md:mx-0"
                  />
                </Link>
              </div>

              <div>
                <h5 className="font-bold mb-4">
                  <Link
                    href="#home"
                    className="text-gray-900 hover:text-revearth-green"
                  >
                    Home
                  </Link>
                </h5>
                <h5 className="font-bold">
                  <Link
                    href="#service"
                    className="text-gray-900 hover:text-revearth-green"
                  >
                    Service
                  </Link>
                </h5>
              </div>

              <div>
                <h5 className="font-bold mb-4">
                  <Link
                    href="#about"
                    className="text-gray-900 hover:text-revearth-green"
                  >
                    About
                  </Link>
                </h5>
                <div className="space-y-2 text-sm">
                  <div>
                    <Link
                      href="#about"
                      className="text-gray-700 hover:text-revearth-green"
                    >
                      What we do
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#customersbenefit"
                      className="text-gray-700 hover:text-revearth-green"
                    >
                      Customer&apos;s benefit
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#RevEarth"
                      className="text-gray-700 hover:text-revearth-green"
                    >
                      About RevEARTH
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#team"
                      className="text-gray-700 hover:text-revearth-green"
                    >
                      Our Team
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="#partnership"
                      className="text-gray-700 hover:text-revearth-green"
                    >
                      Partnership
                    </Link>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Home size={16} />
                  <span className="text-sm">Balanga City, Bataan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={16} />
                  <span className="text-sm">revearth@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone size={16} />
                  <span className="text-sm">+ 01 234 567 88</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
}
