# IOT Bulb
Learning project for interfacing a Raspberry Pi with AWS to turn an LED on and off based on various interfaces. This whole project is using node.js because we hate ourselves.

## Physical button
We can turn our LED (bulb) on and off with a button!

## API
We can control the LED via a REST service.

## MQTT Publish
We send out a published event to AWS MQTT every time the button is pressed.

## MQTT Subscription
We are subscribed to AWS MQTT events to turning the LED on and off too. This is a separate topic from the publish.