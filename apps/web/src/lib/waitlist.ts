export function openWaitlist() {
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("chipa:open-waitlist"));
	}
}
