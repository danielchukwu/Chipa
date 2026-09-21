import { openWaitlist } from "../lib/waitlist";

export function AppleStoreBadge({ className = "" }: { className?: string }) {
	return (
		<button
			type="button"
			onClick={openWaitlist}
			className={`inline-flex items-center gap-3 bg-black hover:bg-black/90 text-white px-5 py-2.5 rounded-2xl border border-black/10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${className}`}
			aria-label="Download Chipa on the Apple App Store"
		>
			{/* Apple Logo SVG */}
			<svg className="w-7 h-7 fill-current shrink-0" viewBox="0 0 170 170">
				<path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.59-7.71-11.66-14-5.88-9.08-10.36-19.53-13.43-31.36-3.08-11.83-4.62-23.07-4.62-33.72 0-14.34 3.58-26.31 10.74-35.91 7.16-9.6 16.48-14.54 27.95-14.81 5.34 0 11.05 1.39 17.13 4.17 6.08 2.78 10.15 4.25 12.22 4.41 1.74-.24 5.9-1.74 12.48-4.51 6.58-2.77 12.35-4.04 17.31-3.82 13.06.66 23.58 5.41 31.55 14.25-11.44 6.94-17.05 16.5-16.83 28.68.22 9.58 3.86 17.65 10.92 24.21 7.06 6.56 15.53 10.23 25.41 11.02-2.18 6.75-4.85 13.38-8.01 19.89zM119.22 33.02c0-7.39 2.65-14.33 7.95-20.81 5.3-6.48 11.96-10.55 19.98-12.21.22 1.09.33 2.18.33 3.27 0 7.39-2.76 14.53-8.28 21.41-5.52 6.88-12.25 10.89-20.19 12.02-.22-1.2-.33-2.43-.33-3.68z" />
			</svg>
			<div className="text-left leading-none">
				<span className="block text-[10px] sm:text-[11px] font-medium text-gray-300 tracking-wide uppercase">
					Download on the
				</span>
				<span className="block text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
					App Store
				</span>
			</div>
		</button>
	);
}

export function GooglePlayBadge({ className = "" }: { className?: string }) {
	return (
		<button
			type="button"
			onClick={openWaitlist}
			className={`inline-flex items-center gap-3 bg-black hover:bg-black/90 text-white px-5 py-2.5 rounded-2xl border border-black/10 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${className}`}
			aria-label="Get Chipa on Google Play"
		>
			{/* Google Play Triangle SVG */}
			<svg className="w-6 h-6 shrink-0" viewBox="0 0 512 512">
				<path
					fill="#00E676"
					d="M32.5 17.5C28.2 22 25.6 28.6 25.6 37.3v437.4c0 8.7 2.6 15.3 6.9 19.8l1.1 1.1L279 250.2v-5.4L33.6 16.4l-1.1 1.1z"
				/>
				<path
					fill="#FFD600"
					d="M362.4 333.6l-83.4-83.4v-5.4l83.4-83.4 1.9 1.1 98.7 56.1c28.2 16 28.2 42.2 0 58.3l-98.7 56.1-1.9.6z"
				/>
				<path
					fill="#FF3D00"
					d="M364.3 333L279 247.5 32.5 494.5c9.3 9.8 24.6 11 41.7 1.3l290.1-162.8"
				/>
				<path
					fill="#00B0FF"
					d="M364.3 179L74.2 16.2C57.1 6.5 41.8 7.7 32.5 17.5L279 264.5l85.3-85.5z"
				/>
			</svg>
			<div className="text-left leading-none">
				<span className="block text-[10px] sm:text-[11px] font-medium text-gray-300 tracking-wide uppercase">
					GET IT ON
				</span>
				<span className="block text-sm sm:text-base font-bold text-white tracking-tight mt-0.5">
					Google Play
				</span>
			</div>
		</button>
	);
}
