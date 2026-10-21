"""Offline webcam motion prank prototype. No video is saved or sent anywhere.
Install optional dependency: python -m pip install opencv-python
Run: python projects/02-motion-prank/motion_prank.py --camera 0
Actual operation on the user's Acer has NOT been verified.
"""
import argparse
import sys
import time
from pathlib import Path

class MotionGate:
    """Debounce motion for N consecutive frames and apply a trigger cooldown."""
    def __init__(self, threshold=0.03, min_frames=3, cooldown_seconds=5.0):
        if not (0 < threshold <= 1):
            raise ValueError("threshold must be between 0 and 1 (exclusive of 0)")
        if min_frames < 1 or cooldown_seconds < 0:
            raise ValueError("frames >= 1 and cooldown >= 0 required")
        self.threshold = threshold
        self.min_frames = min_frames
        self.cooldown_seconds = cooldown_seconds
        self.frames = 0
        self.last_trigger = float("-inf")

    def observe(self, motion_fraction, time_seconds):
        if not (0 <= motion_fraction <= 1):
            raise ValueError("motion_fraction outside 0..1")
        self.frames = self.frames + 1 if motion_fraction >= self.threshold else 0
        if self.frames >= self.min_frames and time_seconds-self.last_trigger >= self.cooldown_seconds:
            self.last_trigger = time_seconds
            self.frames = 0
            return True
        return False

def trigger(wav_path=None):
    if wav_path is None:
        print("\aMotion detected (terminal bell; audible playback not guaranteed).")
    elif sys.platform == "win32":
        import winsound
        winsound.PlaySound(str(wav_path), winsound.SND_FILENAME | winsound.SND_ASYNC)
    else:
        print("Motion detected; WAV playback in this starter is Windows-only.")

def main(argv=None):
    parser = argparse.ArgumentParser(description="Local webcam motion alarm without recordings.")
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--min-motion", type=float, default=0.03)
    parser.add_argument("--min-frames", type=int, default=3)
    parser.add_argument("--cooldown", type=float, default=5.0)
    parser.add_argument("--wav", type=Path, help="User-provided WAV (Windows playback only)")
    args = parser.parse_args(argv)
    gate = MotionGate(args.min_motion, args.min_frames, args.cooldown)
    if args.wav and not args.wav.is_file():
        parser.error("Selected WAV file not found.")
    try:
        import cv2
    except ImportError:
        parser.error("opencv-python is not installed; see BUILD.md.")
    camera = cv2.VideoCapture(args.camera)
    if not camera.isOpened():
        camera.release()
        raise SystemExit("Cannot open camera. Check privacy settings and --camera index.")
    subtractor = cv2.createBackgroundSubtractorMOG2(history=250, varThreshold=32, detectShadows=False)
    warmup_frames = 30
    print("Camera running locally; press q in preview to exit. No frames are saved.")
    try:
        while True:
            ok, frame = camera.read()
            if not ok:
                break
            small = cv2.resize(frame, (320, 240))
            mask = subtractor.apply(small)
            if warmup_frames:
                warmup_frames -= 1
            else:
                mask = cv2.medianBlur(mask, 5)
                fraction = cv2.countNonZero(mask) / float(mask.size)
                if gate.observe(fraction, time.monotonic()):
                    trigger(args.wav)
                cv2.putText(frame, "Motion: %.3f" % fraction, (12, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow("Project McGruber: press q to exit", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        camera.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
