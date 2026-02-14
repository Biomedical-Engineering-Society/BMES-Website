"use client";

import { useForm } from "react-hook-form";

type ContactFormData = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting, dirtyFields },
    reset,

  } = useForm<ContactFormData>({
    mode: "onChange",
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      reset();
    }
  };

  const inputStyle = (field: keyof ContactFormData) => {
    if (field === "subject" && touchedFields[field]) {
      return "border-green-500 focus:ring-green-500";
    }

    if (dirtyFields[field]) {
      return errors[field]
        ? "border-red-500 focus:ring-red-500"
        : "border-green-500 focus:ring-green-500";
    }

    return "border-gray-300";
  };

  const icon = (field: keyof ContactFormData) => {
    if (field === "subject" && touchedFields[field]) {
      return <span className="text-green-600 ml-2">✔</span>;
    }

    if (dirtyFields[field]) {
      return errors[field]
        ? <span className="text-red-600 ml-2">✖</span>
        : <span className="text-green-600 ml-2">✔</span>
    }

    return null;
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full space-y-4"
      noValidate
    >
      <h2 className="text-xl font-semibold">Send Us a Message</h2>
      <h3 className="text-xs text-gray-600">Required fields are marked with <span className="text-red-600">*</span></h3>

      {/* Name */}
      <div>
        <label className="block mb-1">
          Name <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center">
          <input
            className={`w-[calc(100%-21px)] rounded-md border p-2 ${inputStyle("name")}`}
            {...register("name", {
              required: "Name is required.",
              minLength: {
                value: 2,
                message: "Must be at least 2 characters.",
              },
            })}
          />
          {icon("name")}
        </div>
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">✖ {errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block mb-1">
          Email <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center">
          <input
            type="email"
            className={`w-[calc(100%-21px)] rounded-md border p-2 ${inputStyle("email")}`}
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address.",
              },
            })}
          />
          {icon("email")}
        </div>
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">✖ {errors.email.message}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className={`block mb-1`}>Subject</label>
        <div className="flex items-center">
          <input
            className={`w-[calc(100%-21px)] rounded-md border p-2 ${inputStyle("subject")}`}
            {...register("subject")}
          />
          {icon("subject")}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block mb-1">
          Message <span className="text-red-600">*</span>
        </label>
        <div className="flex items-start">
          <textarea
            rows={5}
            className={`w-[calc(100%-21px)] rounded-md border p-2 ${inputStyle("message")}`}
            {...register("message", {
              required: "Message is required.",
              minLength: {
                value: 10,
                message: "Must be at least 10 characters.",
              },
            })}
          />
          {icon("message")}
        </div>
        {errors.message && (
          <p className="text-red-600 text-sm mt-1">
            ✖ {errors.message.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#2a296b] text-white px-4 py-2 hover:cursor-pointer hover:bg-[#1f1a4d] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
