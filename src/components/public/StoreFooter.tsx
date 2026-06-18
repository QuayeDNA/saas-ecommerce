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
        className="px-4 pt-12 pb-10 sm:pt-16 sm:pb-14"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          <div className="space-y-5 text-center sm:text-left">
            {hasSocial && (
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {social?.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.18)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                    }}
                  >
                    <FaFacebook className="w-4 h-4 text-white/60 hover:text-white transition" />
                  </a>
                )}
                {social?.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.18)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                    }}
                  >
                    <FaTwitter className="w-4 h-4 text-white/60 hover:text-white transition" />
                  </a>
                )}
                {social?.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.18)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                    }}
                  >
                    <FaInstagram className="w-4 h-4 text-white/60 hover:text-white transition" />
                  </a>
                )}
              </div>
            )}
            {hasContact && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2 text-sm text-white/70">
                {storefront.contactInfo?.phone && (
                  <a
                    href={`tel:${storefront.contactInfo.phone}`}
                    className="flex items-center gap-1.5 transition hover:text-white"
                  >
                    <FaPhone className="w-3 h-3 text-white/50" />
                    {storefront.contactInfo.phone}
                  </a>
                )}
                {storefront.contactInfo?.whatsapp && (
                  <a
                    href={`https://wa.me/${normalizeWhatsappNumber(storefront.contactInfo.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-semibold transition hover:text-white"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    <FaWhatsapp className="w-4 h-4" style={{ color: "rgba(255,255,255,0.5)" }} />
                    WhatsApp
                  </a>
                )}
                {storefront.contactInfo?.email && (
                  <a
                    href={`mailto:${storefront.contactInfo.email}`}
                    className="flex items-center gap-1.5 transition hover:text-white"
                  >
                    <FaEnvelope className="w-3 h-3 text-white/50" />
                    {storefront.contactInfo.email}
                  </a>
                )}
              </div>
            )}
            <p className="text-xs text-white/50">
              {footerText}
              <span className="mx-2 text-white/20">|</span>
              <span className="font-medium text-white/80">
                {storefront.businessName}
              </span>
            </p>
          </div>
          <p className="text-xs text-center sm:text-right text-white/50">
            Made with love by{" "}
            <a
              href="https://quayedna-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white hover:underline transition"
            >
              DNA Studios
            </a>
          </p>
        </div>
      </footer>
    );
  },
);
