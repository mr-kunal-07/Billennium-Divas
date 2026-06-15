import { ArrowRight } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";
const Footer = () => {
    const socialLinks = [
        { icon: FaInstagram, href: "https://www.instagram.com/billenniumdivas", label: "Instagram" },
        { icon: FaLinkedin, href: "https://www.linkedin.com/company/billenniumdivas", label: "LinkedIn" },
        { icon: FaYoutube, href: "https://www.youtube.com/@billenniumdivas", label: "YouTube" },
        { icon: FaFacebook, href: "https://www.facebook.com/billenniumdivas", label: "Facebook" },
    ];

    const footerLinks = [
        { label: "About us", href: "/about" },
        { label: "Privacy Policy", href: "/privacypolicy" },
        { label: "Terms and Conditions", href: "/terms" },
        { label: "Contact us", href: "/contact" },
    ];

    return (
        <>
            {/* CTA Section */}
            <section className="bg-linear-to-r from-pink-100 via-purple-100 to-pink-100 py-20">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8">
                        Ready to accelerate your entrepreneurship journey?
                    </h2>
                    <a
                        href="/register"
                        className="inline-block px-8 py-3 bg-linear-to-r from-pink-600 to-pink-900 text-white font-medium rounded-md hover:shadow-2xl transition-all duration-300 text-lg"
                    >
                        <span className='flex items-center gap-2'>
                            Get started
                            <ArrowRight className='w-6 h-6' />
                        </span>
                    </a>
                </div>

            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">

                        {/* Left: Logo and Social */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <h3 className="text-2xl font-bold text-gray-900">Billennium Divas</h3>
                            <div className="flex gap-4">
                                {socialLinks.map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={social.label}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition-colors"
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Right: Links */}
                        <nav className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
                            {footerLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.href}
                                    className="text-gray-600 hover:text-pink-600 transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Copyright */}
                    <div className="mt-10 pt-8 border-t border-gray-200 text-center">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} Billennium Divas. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Footer;