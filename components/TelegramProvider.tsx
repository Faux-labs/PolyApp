"use client";
import { useEffect } from 'react';

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Dynamically import to avoid SSR issues
        const initTelegram = async () => {
            try {
                const sdk = await import('@telegram-apps/sdk');
                sdk.init();

                try {
                    sdk.miniApp.mountSync();
                } catch (error) {
                    console.warn("MiniApp mount failed (likely not in Telegram environment):", error);
                }

                // Signal that the app is ready to be displayed
                // This removes the loading spinner in Telegram
                if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
                    (window as any).Telegram.WebApp.ready();
                    (window as any).Telegram.WebApp.expand(); // Optional: expand to full height
                }

                try {
                    sdk.mainButton.mount();
                    sdk.mainButton.setParams({
                        text: 'VIEW TRADES',
                        backgroundColor: '#000000',
                        textColor: '#FFFFFF',
                        isVisible: true,
                        isEnabled: true,
                    });
                    // Set the header color to match your Neobrutalist theme
                    sdk.miniApp.setHeaderColor('#000000');
                } catch (e) {
                    console.warn("MainButton failed", e);
                }

            } catch (err) {
                console.error("Failed to load Telegram SDK:", err);
            }
        };

        initTelegram();
    }, []);

    return <>{children}</>;
}