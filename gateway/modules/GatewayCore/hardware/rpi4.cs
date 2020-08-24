using System;

namespace Hardware
{
    public class GatewayRPI4 : IGatewayHardware
    {
        // Hardware

        public event EventHandler UserButtonPushed; // No implementado (Nunca se lanza)

        private Random rndGenerator;                // Generador de aleatorios para simular entradas

        public GatewayRPI4()
        {
            // Inicializa el generador de numeros aleatorios

            rndGenerator = new Random((int)(DateTime.Now.Ticks));
        }

        /// <summary>
        /// Devuelve el estado del led de status.
        /// </summary>
        public LedState GetStatusLed()
        {
            return LedState.Off;
        }

        /// <summary>
        /// Establece el estado del led de status.
        /// </summary>
        public void SetStatusLed(LedState state)
        {
            
        }

        /// <summary>
        /// Alterna el estado del led de status.
        /// </summary>
        public void ToggleStatusLed()
        {
            
        }

        /// <summary>
        /// Devuelve el estado del led de usuario.
        /// </summary>
        public LedState GetUserLed()
        {
            return LedState.Off;
        }

        /// <summary>
        /// Establece el estado del led de usuario.
        /// </summary>
        public void SetUserLed(LedState state)
        {
           
        }

        /// <summary>
        /// Alterna el estado del led de usuario.
        /// </summary>
        public void ToggleUserLed()
        {
            
        }

        /// <summary>
        /// Invoca el evento UserButtonPushed
        /// </summary>
        protected virtual void OnUserButtonPushed(EventArgs e)
        {
            UserButtonPushed?.Invoke(this, e);
        }

        /// <summary>
        /// Permite obtener la hora desde el RTC de la placa
        /// </summary>
        public DateTime GetRtcDateTime()
        {
            return DateTime.Now;
        }

        /// <summary>
        /// Permite establecer la hora al RTC de la placa
        /// </summary>
        public void SetRtcDateTime(DateTime dt)
        {
            
        }

        /// <summary>
        /// Permite obtener la temperatura desde el RTC de la placa
        /// </summary>
        public Single GetRtcTemperature()
        {
            return (Single)(15.0 + 5 * rndGenerator.NextDouble());
        }

        public float GetPowerVoltage()
        {
            return (Single)(12.0 + rndGenerator.NextDouble());
        }

        public float GetSensedVoltage()
        {
            return (Single)(18.0 + 2 * rndGenerator.NextDouble());
        }

        public float GetBatteryVoltage()
        {
            return (Single)(2.9 + 0.1 * rndGenerator.NextDouble());
        }
    }


}
