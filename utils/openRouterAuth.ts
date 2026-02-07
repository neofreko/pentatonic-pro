
export const generateCodeVerifier = () => {
    const array = new Uint32Array(56);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
};

export const generateCodeChallenge = async (codeVerifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export const initiateOpenRouterLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code_verifier to exchange it later
    localStorage.setItem('openrouter_code_verifier', codeVerifier);

    // Use origin + BASE_URL to ensure we match Vite's routing exactly
    const baseUrl = (import.meta as any).env.BASE_URL || '/';
    const callbackUrl = window.location.origin + (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');

    const authUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(callbackUrl)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    window.location.href = authUrl;
};

export const handleOpenRouterCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const codeVerifier = localStorage.getItem('openrouter_code_verifier');

    if (code && codeVerifier) {
        try {
            const response = await fetch('https://openrouter.ai/api/v1/auth/keys', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    code_verifier: codeVerifier,
                    code_challenge_method: 'S256',
                }),
            });

            const data = await response.json();
            if (data.key) {
                localStorage.setItem('openrouter_api_key', data.key);
                // Clear the verifier and the code from URL
                localStorage.removeItem('openrouter_code_verifier');

                // Remove code from URL without refreshing
                const baseUrl = (import.meta as any).env.BASE_URL || '/';
                const cleanUrl = window.location.origin + (baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');
                window.history.replaceState({}, document.title, cleanUrl);

                return { success: true, key: data.key };
            } else {
                return { success: false, error: data.error?.message || 'Failed to exchange code for key' };
            }
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
    return null;
};
