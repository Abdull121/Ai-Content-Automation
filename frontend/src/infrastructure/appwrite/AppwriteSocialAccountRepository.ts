import { SocialAccountRepository } from "@/domain/repositories/SocialAccountRepository";
import { SocialAccount } from "@/domain/entities/SocialAccount";
import { Platform } from "@/domain/entities/Platform";

export class AppwriteSocialAccountRepository implements SocialAccountRepository {
  async listAccounts(): Promise<SocialAccount[]> {
    const res = await fetch("/api/accounts");
    if (!res.ok) throw new Error("Failed to load connected accounts");
    const { accounts } = await res.json();
    return accounts;
  }

  async connectAccount(platform: Platform): Promise<void> {
    // OAuth connect flows are set up per-platform outside this app for now
    // (see backend/scripts/seed-accounts.mjs); wiring an in-app OAuth button
    // is a follow-up once TikTok's audit clears.
    throw new Error(`Connecting ${platform} from the UI isn't wired up yet`);
  }
}
