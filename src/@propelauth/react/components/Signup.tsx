import { SyntheticEvent, useState } from "react";
import { apiSignup, SignupOptions } from "../api/signup";
import { Container, Logo, Input, Button, H3 } from "../elements";
import { Config, useConfig } from "../state";
import { Appearance, getTokenFromURL } from "../utils";
import { ErrorMessage } from "./shared/ErrorMessage";
import { SigninOptions } from "./shared/SigninOptions";

export type SignupProps = {
  afterSignup?: VoidFunction;
  onRedirectToLogin?: VoidFunction;
  presetEmail?: string;
  appearance?: SignupAppearance;
};

export type SignupAppearance = {
  options?: {
    logoPosition?: "inside" | "outside" | "none";
    greetingText?: string | null;
    showDivider?: boolean;
  };
  elements?: {
    Container?: Appearance;
    Logo?: Appearance;
    EmailInput?: Appearance;
    PasswordInput?: Appearance;
    SubmitButton?: Appearance;
    LoginLink?: Appearance;
  };
};

export const Signup = ({ afterSignup, onRedirectToLogin, presetEmail, appearance }: SignupProps) => {
  const { config } = useConfig();

  return (
    <Container appearance={appearance?.elements?.Container}>
      <Logo src={config.logo_url} alt={config.site_display_name} appearance={appearance?.elements?.Logo} />
      <H3>{appearance?.options?.greetingText || "Create an account"}</H3>
      <SigninOptions config={config} />
      {config.has_password_login && config.has_any_social_login && <hr />}
      {config.has_password_login && <SignupForm config={config} afterSignup={afterSignup} presetEmail={presetEmail} />}
      <BottomLinks onRedirectToLogin={onRedirectToLogin} appearance={appearance} />
    </Container>
  );
};

type SignupFormProps = {
  config: Config;
  presetEmail?: string;
  afterSignup?: VoidFunction;
};

const SignupForm = ({ config, presetEmail, afterSignup }: SignupFormProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(presetEmail || "");
  const [password, setPassword] = useState("");
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const signup = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);

    const options: SignupOptions = {
      email: email,
      password: password,
    };

    if (config.require_name) {
      options.firstName = firstName;
      options.lastName = lastName;
    }

    if (config.require_username) {
      options.username = username;
    }

    const inviteToken = getTokenFromURL();
    if (inviteToken) {
      options.inviteToken = inviteToken;
    }

    const signupResult = await apiSignup(options);
    if (signupResult.success) {
      if (afterSignup) {
        afterSignup();
      } else {
        // Some default function?
        // Render account component?
        // Push window location to home?
      }
    } else {
      setError(signupResult.error_message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={signup}>
      {config.require_name && (
        <div>
          <Input
            required
            type="text"
            value={firstName}
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="First Name"
          />
          <Input
            required
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />
        </div>
      )}
      <div>
        <Input
          required
          type="email"
          placeholder="Email"
          value={email}
          readOnly={!!presetEmail}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {config.require_username && (
        <div>
          <Input
            required
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      )}
      <div>
        <Input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button loading={loading}>Sign up</Button>
      <ErrorMessage error={error} />
    </form>
  );
};

type BottomLinksProps = {
  onRedirectToLogin?: VoidFunction;
  appearance?: SignupAppearance;
};

const BottomLinks = ({ onRedirectToLogin, appearance }: BottomLinksProps) => {
  return (
    <>
      {onRedirectToLogin && (
        <Button onClick={onRedirectToLogin} appearance={appearance?.elements?.LoginLink}>
          Log in
        </Button>
      )}
    </>
  );
};
