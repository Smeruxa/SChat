import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
    Login: undefined;
    Dialogs: undefined;
    Chat: { name: string };
    FindPeople: undefined;
    Register: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;
export type DialogsScreenProps = NativeStackScreenProps<RootStackParamList, "Dialogs">;
export type ChatScreenProps = NativeStackScreenProps<RootStackParamList, "Chat">;
export type FindPeopleScreenProps = NativeStackScreenProps<RootStackParamList, "FindPeople">;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, "Register">;