import { Navbar } from "@/components/navbar"
import { ThemeToggle } from "@/components/theme-toggle"
import dynamic from "next/dynamic"

const Footer = dynamic(() => import("@/components/footer").then((mod) => mod.Footer))
const MobileNav = dynamic(() => import("@/components/mobile-nav").then((mod) => mod.MobileNav))
import Link from "next/link"
import { ArrowRight, Leaf, Heart, Shield, Truck } from "lucide-react"
import { getCachedCategories, getCachedFeaturedProducts } from "@/lib/cache"
import Image from "next/image"

// Revalidate every 5 minutes instead of on every request
export const revalidate = 300

export default async function Home() {
  // Parallelize database queries for faster loading
  const [featuredProducts, categories] = await Promise.all([
    getCachedFeaturedProducts(8),
    getCachedCategories(),
  ])
  
  // Limit categories to 4 for homepage
  const limitedCategories = categories.slice(0, 4)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="Hero background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={85}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-8">
          <p className="text-sm tracking-[0.3em] uppercase text-white/80 animate-fade-down">
            Premium Quality Products
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white leading-tight animate-fade-up text-balance">
            Treat yourself like you deserve it
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto animate-fade-up stagger-1">
            Discover our curated collection of exceptional products designed for the discerning customer
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-up stagger-2">
            <Link
              href="/categories"
              className="px-8 py-4 bg-white text-black text-sm tracking-wider uppercase hover:bg-white/90 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/collections"
              className="px-8 py-4 border border-white text-white text-sm tracking-wider uppercase hover:bg-white/10 transition-colors"
            >
              View Collections
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Select a category and choose your product accordingly
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {limitedCategories.length > 0 ? (
              limitedCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group relative aspect-[3/4] overflow-hidden img-zoom"
                >
                  <Image
                    src={category.image_url || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80`}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-center tracking-wider uppercase">
                      {category.name}
                    </h3>
                    <span className="mt-2 text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                      Shop Now
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <>
                {[
                  { name: "New Arrivals", href: "/new-arrivals" },
                  { name: "Best Sellers", href: "/categories" },
                  { name: "Featured", href: "/categories" },
                  { name: "Collections", href: "/collections" },
                ].map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="group relative aspect-[3/4] overflow-hidden img-zoom"
                  >
                    <Image
                      src={`https://images.unsplash.com/photo-${index === 0 ? "1441986300917-64674bd600d8" : index === 1 ? "1472851294608-062f824d29cc" : index === 2 ? "1560472354-b33ff0c44a43" : "1556905055-8f358a7a47b2"}?w=600&q=80`}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                      <h3 className="text-lg md:text-xl lg:text-2xl font-serif text-center tracking-wider uppercase">
                        {item.name}
                      </h3>
                      <span className="mt-2 text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                        Shop Now
                      </span>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">Featured Products</h2>
              <p className="text-muted-foreground max-w-lg">
                Hand-picked selections from our premium collection
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm tracking-wider uppercase mt-4 md:mt-0 hover:opacity-60 transition-opacity"
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => {
                const firstImage = product.product_images?.[0]?.image_url
                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-muted img-zoom">
                      <Image
                        src={firstImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {product.categories?.name || "Matthew's Mart"}
                      </p>
                      <h3 className="font-medium group-hover:opacity-60 transition-opacity line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm">
                        ₦{product.price_usd ? (product.price_usd / 100).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </Link>
                )
              })
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No products available yet. Check back soon!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">Why Choose Matthew's Mart</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We believe in quality, sustainability, and exceptional customer service
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-border">
                <Leaf size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">
                Every product is carefully selected for exceptional quality
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-border">
                <Heart size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg mb-2">Made with Care</h3>
              <p className="text-sm text-muted-foreground">
                Crafted by artisans who take pride in their work
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-border">
                <Truck size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg mb-2">Fast Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Free shipping on orders over ₦50,000
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center border border-border">
                <Shield size={28} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg mb-2">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">
                Safe and secure payment processing with Stripe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 lg:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative aspect-[4/5] overflow-hidden img-zoom">
              <Image
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
                alt="About Matthew's Mart"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground">About Us</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif">The Matthew's Mart Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Matthew's Mart was founded with a simple mission: to bring exceptional quality products
                  to discerning customers who appreciate the finer things in life.
                </p>
                <p>
                  We believe that quality should never be compromised. Every product in our
                  collection is carefully selected and vetted to ensure it meets our high standards.
                </p>
                <p>
                  Our commitment to excellence extends beyond our products to our customer service.
                  We're here to help you find exactly what you're looking for.
                </p>
              </div>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-sm tracking-wider uppercase hover:opacity-60 transition-opacity"
              >
                Discover Our Collection
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">FAQs</h2>
            <p className="text-muted-foreground">
              Frequently Asked Questions
            </p>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                q: "What is your return policy?",
                a: "We offer a 30-day return policy for all unused items in their original packaging. Simply contact our support team to initiate a return."
              },
              {
                q: "How long does shipping take?",
                a: "Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business day delivery."
              },
              {
                q: "Do you ship internationally?",
                a: "Yes! We ship to most countries worldwide. International shipping typically takes 10-14 business days."
              },
              {
                q: "How can I track my order?",
                a: "Once your order ships, you'll receive a tracking number via email. You can also track your order in your account dashboard."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and Apple Pay through our secure Stripe payment processing."
              }
            ].map((faq, index) => (
              <details key={index} className="group py-6">
                <summary className="flex justify-between items-center cursor-pointer list-none">
                  <h3 className="font-medium pr-4">{faq.q}</h3>
                  <span className="text-2xl font-light group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-muted-foreground pr-8">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6">Ready to Discover?</h2>
          <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
            Join thousands of satisfied customers who have elevated their lifestyle with Matthew's Mart products.
          </p>
          <Link
            href="/categories"
            className="inline-block px-8 py-4 bg-primary-foreground text-primary text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Start Shopping
          </Link>
        </div>
      </section>

      <Footer />
      <MobileNav />

      {/* Spacer for mobile nav */}
      <div className="h-16 lg:hidden" />
    </main>
  )
}
