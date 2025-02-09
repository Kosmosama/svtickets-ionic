# SvTickets (Ionic)
This project is a ported version of svTickets to Ionic, developed for the 2024/2025 class on client-side web applications.

## Installation

To install the necessary dependencies, run:

```sh
npm install
```

## Running the App

### In Browser (Navigator)
To run the app in a web browser, use the following command:

```sh
ng serve --no-hmr
```

### On a Mobile Device
To build and run the app on an Android phone:

1. Build the project:
   ```sh
   ionic build
   ```
2. Sync with Capacitor:
   ```sh
   npx cap sync android
   ```
3. Open the Android project in Android Studio:
   - Navigate to the `android` folder and open it in Android Studio.
   - Press the **Run** button to deploy the app on your device.

## Additional Notes
- Ensure you have Ionic, Angular, and Capacitor properly installed.
- Android Studio must be installed to build and deploy on an Android device.
- Enable USB debugging on your Android device if deploying via USB.
