## This is the React Native example

 - Install Android Studio
 - Add an AVD
 - Launch the AVD
 - Install [`yalc`](https://github.com/wclr/yalc)
 - From the root of the SDK run `yalc publish`
 - Come back to the React Native example
 - Run `yalc add "@hashgraph/sdk"`
 - From one terminal run `yarn start android`
 - From another terminal run `yarn android`
 - The launched AVD should now show the example

#### Note

To use the SDK with React Native you'll need to add `expo-random` as a dependecy yourself using `yarn add expo-random`
Otherwise generating `Mnemonic` or `PrivateKey` will fail
