"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useActionState } from "react";
import { contactAction, State } from "./actions";

const SUPPORT_EMAIL = "alxa0684@gmail.com";
const SUPPORT_PHONE = "+20 155 900 5729";
const WHATSAPP_NUMBER = "201559005729"; // WhatsApp contact number

const initialState: State = { message: null, errors: {}, success: false };
export default function ContactPage() {
  const [state, formAction] = useActionState(contactAction, initialState);

  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCounts, setCharCounts] = useState({
    name: 0,
    subject: 0,
    message: 0,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 15) {
      setFormData({ ...formData, name: value });
      setCharCounts({ ...charCounts, name: value.length });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 30) {
      setFormData({ ...formData, subject: value });
      setCharCounts({ ...charCounts, subject: value.length });
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setFormData({ ...formData, message: value });
      setCharCounts({ ...charCounts, message: value.length });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Actually send the email
    const result = await sendContactEmail({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      category: formData.category,
      message: formData.message,
    });

    if (result.success) {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    } else {
      toast({
        title: "Failed to send message",
        description: result.error || "Please try again later.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container py-8 px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg">
              We'd love to hear from you. Send us a message and we'll respond as
              soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center lg:text-left">
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-sm text-muted-foreground hover:text-primary underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <a
                        href={`tel:${SUPPORT_PHONE.replace(/[^\d+]/g, "")}`}
                        className="text-sm text-muted-foreground hover:text-primary underline transition-colors"
                      >
                        {SUPPORT_PHONE}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5 rotate-45" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        className="text-sm text-muted-foreground hover:text-primary underline transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        123 Art Street
                        <br />
                        New York, NY 10001
                        <br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Sunday: 9:00 AM - 12:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">
                        <a
                          href="https://wa.me/201559005729"
                          className="hover:underline"
                        >
                          +20 155 900 5729
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center lg:text-left">
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-medium">
                        How long does shipping take?
                      </p>
                      <p className="text-muted-foreground">
                        Standard shipping takes 3 business days.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">What is your return policy?</p>
                      <p className="text-muted-foreground">
                        Items can be returned within 30 days of delivery.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">
                        Do you ship internationally?
                      </p>
                      <p className="text-muted-foreground">
                        Currently, we only ship within the United States.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center lg:text-left">
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={formAction} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleNameChange}
                          required
                          aria-describedby="name-error"
                        />
                        <div className="flex justify-between items-center">
                          <div
                            id="name-error"
                            aria-live="polite"
                            aria-atomic="true"
                          >
                            {state.errors?.name &&
                              state.errors.name.map((error: string) => (
                                <p className="text-sm text-red-500" key={error}>
                                  {error}
                                </p>
                              ))}
                          </div>
                          <span
                            className={`text-xs ${
                              charCounts.name > 12
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {charCounts.name}/15
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleEmailChange}
                          required
                          aria-describedby="email-error"
                        />
                        <div
                          id="email-error"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {state.errors?.email &&
                            state.errors.email.map((error: string) => (
                              <p
                                className="mt-1 text-sm text-red-500"
                                key={error}
                              >
                                {error}
                              </p>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" value={formData.category}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">
                              General Inquiry
                            </SelectItem>
                            <SelectItem value="order">Order Support</SelectItem>
                            <SelectItem value="shipping">
                              Shipping Question
                            </SelectItem>
                            <SelectItem value="return">
                              Return/Exchange
                            </SelectItem>
                            <SelectItem value="technical">
                              Technical Issue
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleSubjectChange}
                          required
                          aria-describedby="subject-error"
                        />
                        <div className="flex justify-between items-center">
                          <div
                            id="subject-error"
                            aria-live="polite"
                            aria-atomic="true"
                          >
                            {state.errors?.subject &&
                              state.errors.subject.map((error: string) => (
                                <p className="text-sm text-red-500" key={error}>
                                  {error}
                                </p>
                              ))}
                          </div>
                          <span
                            className={`text-xs ${
                              charCounts.subject > 24
                                ? "text-red-500"
                                : "text-muted-foreground"
                            }`}
                          >
                            {charCounts.subject}/30
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleMessageChange}
                        required
                        aria-describedby="message-error"
                      />
                      <div className="flex justify-between items-center">
                        <div
                          id="message-error"
                          aria-live="polite"
                          aria-atomic="true"
                        >
                          {state.errors?.message &&
                            state.errors.message.map((error: string) => (
                              <p className="text-sm text-red-500" key={error}>
                                {error}
                              </p>
                            ))}
                        </div>
                        <span
                          className={`text-xs ${
                            charCounts.message > 400
                              ? "text-red-500"
                              : "text-muted-foreground"
                          }`}
                        >
                          {charCounts.message}/500
                        </span>
                      </div>
                    </div>

                    {state.message && (
                      <div
                        className={`text-center text-sm ${
                          state.success ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {state.message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>Sending...</span>
                      ) : (
                        <span>Send Message</span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
