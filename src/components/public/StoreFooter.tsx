import { memo } from "react";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import { FaPhone, FaEnvelope } from "react-icons/fa6";
import { getSystemFooterText } from "./constants";
import { normalizeWhatsappNumber } from "./utils";

// =============================================================================
// StoreFooter — social links + contact + credit
// =============================================================================

interface StoreFooterProps {
  storefront: {
    displayName?: string;
    businessName?: string;
    contactInfo?: {
      phone?: string;
      email?: string;
      whatsapp?: string;
    };
  };
  branding: {
    footerText?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
    };
  };
}

export const StoreFooter = memo(
  ({ storefront, branding }: StoreFooterProps) => {
    const social = branding.socialLinks;
    const hasSocial = social && Object.values(social).some(Boolean);
    const hasContact =
      storefront.contactInfo &&
      (storefront.contactInfo.phone ||
        storefront.contactInfo.email ||
        storefront.contactInfo.whatsapp);

    // If the store has no contact/socials and the footer text is truly empty, hide the footer.
    const footerText =
      (branding.footerText || "").trim() ||
      getSystemFooterText(storefront.businessName || "");
    if (!hasSocial && !hasContact && !footerText) return null;

    return (
      <footer
        className="border-t px-4 py-8"
        style={{
          backgroundColor: "var(--bg-muted)",
          borderColor: "var(--border-color)",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-3 sm:space-y-0 text-center sm:text-left">
            {hasSocial && (
              <div className="flex items-center justify-center sm:justify-start gap-5">
                {social?.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <FaFacebook className="w-5 h-5" />
                  </a>
                )}
                {social?.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-sky-500 transition"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <FaTwitter className="w-5 h-5" />
                  </a>
                )}
                {social?.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-pink-600 transition"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <FaInstagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
            {hasContact && (
              <div
                className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {storefront.contactInfo?.phone && (
                  <a
                    href={`tel:${storefront.contactInfo.phone}`}
                    className="flex items-center gap-1.5 transition"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "";
                    }}
                  >
                    <FaPhone className="w-3 h-3" />
                    {storefront.contactInfo.phone}
                  </a>
                )}
                {storefront.contactInfo?.whatsapp && (
                  <a
                    href={`https://wa.me/${normalizeWhatsappNumber(storefront.contactInfo.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-semibold transition"
                    style={{ color: "#25D366" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#20BD5C";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "#25D366";
                    }}
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
                {storefront.contactInfo?.email && (
                  <a
                    href={`mailto:${storefront.contactInfo.email}`}
                    className="flex items-center gap-1.5 transition"
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color =
                        "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = "";
                    }}
                  >
                    <FaEnvelope className="w-3 h-3" />
                    {storefront.contactInfo.email}
                  </a>
                )}
              </div>
            )}
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {footerText}
              <span className="mx-2" style={{ color: "var(--text-tertiary)" }}>
                |
              </span>
              <span
                className="font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {storefront.businessName}
              </span>
            </p>
          </div>
          <p
            className="text-xs text-center sm:text-right"
            style={{ color: "var(--text-tertiary)" }}
          >
            Made with love by{" "}
            <a
              href="https://quayedna-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              DNA Studios
            </a>
          </p>
        </div>
      </footer>
    );
  },
);
