using System;
using System.Device.Gpio;
using System.Device.I2c;
using Iot.Device.Rtc;

namespace Hardware
{
    public enum LedState { On, Off }
    public interface IGatewayHardware
    {
        // Status and User Leds

        void SetStatusLed(LedState state);
        LedState GetStatusLed();
        void ToggleStatusLed();

        void SetUserLed(LedState state);
        LedState GetUserLed();
        void ToggleUserLed();

        //void Rs485Write(byte[] buffer, int count);
        //int Rs485Read(byte[] buffer, int count);

        // User Button

        event EventHandler UserButtonPushed;

        // Rtc

        DateTime GetRtcDateTime();
        void SetRtcDateTime(DateTime dt);
        Single GetRtcTemperature();

        // Voltages

        Single GetPowerVoltage();
        Single GetSensedVoltage();
        Single GetBatteryVoltage();
    }
}