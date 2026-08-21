import re
import sys
import time
import httpx
import serial

sys.stdout.reconfigure(encoding='utf-8')

COM_PORT = 'COM7'
BAUD_RATE = 115200
API_URL = 'http://127.0.0.1:8000/api/v1/sensor/readings'

def start_bridge():
    print(f"==================================================")
    print(f"   TVCE ESP32 Node-A USB Serial Bridge Active    ")
    print(f"==================================================")
    print(f"Connecting to Node-A on {COM_PORT} at {BAUD_RATE} baud...")
    print(f"Targeting FastAPI Backend: {API_URL}")
    print(f"Note: Close Serial Monitor in Arduino IDE if port is busy!\n")

    while True:
        try:
            ser = serial.Serial(COM_PORT, BAUD_RATE, timeout=1)
            print(f"🟢 Connected to {COM_PORT}! Listening for live ESP32 condition logs...\n")
            buffer = []
            
            while True:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    print(f"[Node-A Serial]: {line}")
                    buffer.append(line)

                    if "LITTLEFS      : SAVED" in line:
                        full_text = "\n".join(buffer)
                        
                        rec_match = re.search(r"RECORD #\s+:\s+(\d+)", full_text)
                        temp_match = re.search(r"TEMP\s+:\s+([\d.]+)", full_text)
                        hum_match = re.search(r"HUMIDITY\s+:\s+([\d.]+)", full_text)
                        state_match = re.search(r"STATE\s+:\s+(\w+)", full_text)
                        act_match = re.search(r"ACTION\s+:\s+(\w+)", full_text)
                        conf_match = re.search(r"CONFIDENCE\s+:\s+(\d+)", full_text)
                        prev_match = re.search(r"PREVIOUS HASH\s+:\s+([A-F0-9]{64})", full_text, re.IGNORECASE)
                        curr_match = re.search(r"CURRENT HASH\s+:\s+([A-F0-9]{64})", full_text, re.IGNORECASE)

                        if rec_match and temp_match:
                            rec_num = int(rec_match.group(1))
                            temp_c = float(temp_match.group(1))
                            hum_pct = float(hum_match.group(1)) if hum_match else 50.0
                            cond = state_match.group(1) if state_match else "HOLD"
                            act = act_match.group(1) if act_match else "HOLD_VERIFY"
                            conf = float(conf_match.group(1)) if conf_match else 95.0
                            prev_h = prev_match.group(1).upper() if prev_match else "0" * 64
                            curr_h = curr_match.group(1).upper() if curr_match else "0" * 64

                            payload = {
                                "device_code": "ESP32-NODE-01",
                                "device_name": "ESP32 Cold Chain Node A",
                                "record_number": rec_num,
                                "temperature": temp_c,
                                "humidity": hum_pct,
                                "condition": cond,
                                "action": act,
                                "confidence": conf,
                                "previous_hash": prev_h,
                                "current_hash": curr_h,
                            }
                            try:
                                r = httpx.post(API_URL, json=payload, timeout=3.0)
                                print(f"🚀 FORWARDED RECORD #{rec_num} ({temp_c}°C, {cond}) TO BACKEND -> Status: {r.status_code}\n")
                            except Exception as http_err:
                                print(f"⚠️ Backend HTTP post failed: {http_err}\n")

                        buffer = []

        except serial.SerialException as se:
            print(f"⏳ Waiting for {COM_PORT} (Close Arduino IDE Serial Monitor if open)... Retrying in 3s")
            time.sleep(3)
        except Exception as err:
            print(f"Error in serial bridge: {err}")
            time.sleep(2)

if __name__ == "__main__":
    start_bridge()

