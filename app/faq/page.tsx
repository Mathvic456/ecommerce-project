"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MobileNav } from "@/components/mobile-nav"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqCategories = [
  {
    name: "Orders & Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 5-7 business days within the US. Express shipping options are available at checkout for faster delivery (2-3 business days). International shipping times vary by destination."
      },
      {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive an email with your tracking number. You can also track your order by visiting our Track Order page and entering your order number."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes, we ship to most countries worldwide. International shipping costs and delivery times vary depending on the destination. Import duties and taxes may apply and are the responsibility of the customer."
      },
      {
        question: "Can I change or cancel my order?",
        answer: "Orders can be modified or cancelled within 1 hour of placement. After this window, orders enter our fulfillment process and cannot be changed. Please contact our support team immediately if you need assistance."
      }
    ]
  },
  {
    name: "Returns & Refunds",
    questions: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for all unused items in their original packaging. Items must be in new condition with all tags attached. Some exclusions apply for hygiene-sensitive products."
      },
      {
        question: "How do I initiate a return?",
        answer: "To start a return, log into your account and navigate to your order history. Select the order and items you wish to return, then follow the prompts. You'll receive a prepaid shipping label via email."
      },
      {
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 5-7 business days after we receive your returned item. The refund will be issued to your original payment method. Please allow additional time for your bank to process the transaction."
      },
      {
        question: "Can I exchange an item instead of returning it?",
        answer: "Yes, exchanges are available for different sizes or colors of the same item. Please initiate a return and place a new order for the desired item, or contact our support team for assistance."
      }
    ]
  },
  {
    name: "Products & Sizing",
    questions: [
      {
        question: "How do I find my size?",
        answer: "Each product page includes a detailed size guide with measurements. We recommend measuring yourself and comparing to our size charts for the best fit. If you're between sizes, we generally recommend sizing up."
      },
      {
        question: "Are your products authentic?",
        answer: "Absolutely. We source all products directly from authorized manufacturers and distributors. Every item comes with a certificate of authenticity where applicable."
      },
      {
        question: "How do I care for my purchase?",
        answer: "Care instructions are included on each product page and on the item's care label. We recommend following these guidelines to maintain the quality and longevity of your purchase."
      }
    ]
  },
  {
    name: "Account & Payments",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are securely processed through Stripe."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard SSL encryption and never store your full credit card details. All payments are processed through Stripe, a PCI-compliant payment processor."
      },
      {
        question: "How do I reset my password?",
        answer: "Click 'Sign In' and then 'Forgot Password'. Enter your email address and you'll receive a link to reset your password. The link expires after 24 hours for security."
      },
      {
        question: "Can I shop without creating an account?",
        answer: "Yes, guest checkout is available. However, creating an account allows you to track orders, save addresses, view order history, and enjoy a faster checkout experience."
      }
    ]
  }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left hover:text-muted-foreground transition-colors"
      >
        <span className="font-medium pr-8">{question}</span>
        <ChevronDown 
          size={20} 
          className={cn(
            "flex-shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-muted-foreground leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(faqCategories[0].name)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-serif text-center mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto">
            Find answers to common questions about orders, shipping, returns, and more.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {faqCategories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeCategory === category.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div>
          {faqCategories
            .filter((cat) => cat.name === activeCategory)
            .map((category) => (
              <div key={category.name}>
                {category.questions.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center p-8 bg-secondary">
          <h2 className="text-xl font-serif mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you.
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-primary text-primary-foreground text-sm tracking-wider uppercase hover:opacity-90 transition-opacity"
          >
            Contact Us
          </a>
        </div>
      </div>

      <Footer />
      <MobileNav />
      <div className="h-16 lg:hidden" />
    </main>
  )
}
