/**
   @file RAK12032_3_Axis_SetRange_ADXL313.ino
   @author rakwireless.com
   @brief Set the range of ADXL313.
   @version 0.1
   @date 2021-12-25
   @copyright Copyright (c) 2021
**/

#include <Wire.h>
#include <SparkFunADXL313.h> // Click here to get the library: http://librarymanager/All#SparkFun_ADXL313
ADXL313 myAdxl;

void setup()
{ 
  // Initialize Serial for debug output
  time_t timeout = millis();
  Serial.begin(115200);
  while (!Serial)
  {
    if ((millis() - timeout) < 5000)
    {
      delay(100);
    }
    else
    {
      break;
    }
  }
  Serial.println("Set 2G Range and read values from ADXL313");

  Wire.begin();

  if (myAdxl.begin() == false) //Begin communication over I2C
  {
    Serial.println("The sensor did not respond. Please check wiring.");
    while(1)
    {
      delay(10);  
    }
  }
  Serial.println("Sensor is connected properly.");
  
  myAdxl.standby(); // Must be in standby before changing settings.
                    // This is here just in case we already had sensor powered and/or
                    // configured from a previous setup.

  myAdxl.setRange(ADXL313_RANGE_2_G);

  // Try some other range settings by uncommented your choice below
  // myAdxl.setRange(ADXL313_RANGE_05_G);
  // myAdxl.setRange(ADXL313_RANGE_1_G);
  // myAdxl.setRange(ADXL313_RANGE_2_G);
  // myAdxl.setRange(ADXL313_RANGE_4_G);
  
  myAdxl.measureModeOn(); // Wakes up the sensor from standby and puts it into measurement mode
}

void loop()
{
  if(myAdxl.dataReady()) // check data ready interrupt, note, this clears all other int bits in INT_SOURCE reg
  {
    float xAxis,yAxis,zAxis;
    myAdxl.readAccel(); // Read all 3 axis, they are stored in class variables: myAdxl.x, myAdxl.y and myAdxl.z
    /*
     * ±0.5 g : 1024 LSB/g 
     * ±1 g   : 512 LSB/g 
     * ±2 g   : 256 LSB/g 
     * ±4 g   : 128 LSB/g 
     */
    xAxis = (float)myAdxl.x / 256;
    yAxis = (float)myAdxl.y / 256;
    zAxis = (float)myAdxl.z / 256;
    
    Serial.print("  x: ");
    Serial.print(xAxis);
    Serial.print("[g]  y: ");
    Serial.print(yAxis);
    Serial.print("[g]  z: ");
    Serial.print(zAxis);
    Serial.println("[g]");
  }
  else
  {
    Serial.println("Waiting for dataReady.");
  }  
  delay(50);
}
