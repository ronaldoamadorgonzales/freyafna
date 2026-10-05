import { db } from "./db";
import { advisors, leads, financialProfiles, fnaModulesResponses, leadAssignments } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "../auth";

async function main() {
  console.log("Seeding started...");

  // 1. Insert Advisors
  const advisorData = [
    {
      fullName: "Freya Gonzales",
      email: "freya.gonzales@projectkintsugi.com",
      phone: "0917-123-4567",
      advisorCode: "FREYA01",
      title: "Senior Financial Wealth Specialist & Agency Lead",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      isDefault: true,
      calendlyUrl: "https://calendly.com/freya-fna",
      linkedinUrl: "https://linkedin.com/in/freyagonzales",
      status: "ACTIVE" as const,
      role: "ADMIN" as const,
      passwordHash: hashPassword("admin123"),
    },
    {
      fullName: "Arthur Pendragon",
      email: "arthur.pendragon@projectkintsugi.com",
      phone: "0918-987-6543",
      advisorCode: "ARTHUR",
      title: "Licensed Financial & Protection Consultant",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
      isDefault: false,
      calendlyUrl: "https://calendly.com/arthur-pendragon",
      linkedinUrl: "https://linkedin.com/in/arthurpendragon",
      status: "ACTIVE" as const,
      role: "ADVISOR" as const,
      passwordHash: hashPassword("advisor123"),
    },
    {
      fullName: "Guinevere Vance",
      email: "guinevere.vance@projectkintsugi.com",
      phone: "0919-456-7890",
      advisorCode: "GUIN",
      title: "Associate Financial Planner",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      isDefault: false,
      calendlyUrl: "https://calendly.com/guinevere-vance",
      linkedinUrl: "https://linkedin.com/in/guineverevance",
      status: "INACTIVE" as const,
      role: "ADVISOR" as const,
      passwordHash: hashPassword("advisor123"),
    },
  ];

  console.log("Seeding advisors...");
  const seededAdvisors = [];
  for (const adv of advisorData) {
    const existing = await db.select().from(advisors).where(eq(advisors.email, adv.email)).limit(1);
    if (existing.length > 0) {
      console.log(`Advisor ${adv.fullName} already exists. Updating credentials...`);
      const updated = await db.update(advisors).set({
        advisorCode: adv.advisorCode,
        title: adv.title,
        avatarUrl: adv.avatarUrl,
        isDefault: adv.isDefault,
        calendlyUrl: adv.calendlyUrl,
        linkedinUrl: adv.linkedinUrl,
        passwordHash: adv.passwordHash,
        role: adv.role,
        status: adv.status,
      }).where(eq(advisors.email, adv.email)).returning();
      seededAdvisors.push(updated[0]);
    } else {
      const inserted = await db.insert(advisors).values(adv).returning();
      console.log(`Seeded advisor: ${adv.fullName}`);
      seededAdvisors.push(inserted[0]);
    }
  }

  // Find active advisors
  const activeAdvisors = seededAdvisors.filter((a) => a.status === "ACTIVE");

  // 2. Insert mock leads
  const mockLeads = [
    {
      fullName: "John Doe",
      email: "john.doe@example.com",
      mobileNumber: "0915-111-2222",
      overallLeadScore: 85,
      leadCategory: "HOT" as const,
      profile: {
        age: 32,
        maritalStatus: "MARRIED" as const,
        dependentsCount: 2,
        monthlyIncomeRange: "₱100,000+",
        currentSavings: "250000.00",
        retirementAgeGoal: 60,
      },
      responses: [
        {
          moduleType: "MILESTONE_SAVINGS" as const,
          inputs: {
            initialSavings: 250000,
            monthlyContribution: 15000,
            years: 15,
            expectedReturn: 8,
          },
          outputs: {
            projectedTotal: 5045000,
          },
        },
        {
          moduleType: "RETIREMENT" as const,
          inputs: {
            age: 32,
            retirementAgeGoal: 60,
            retExpenses: 80000,
            retPension: 15000,
          },
          outputs: {
            retirementTarget: 16000000,
            retirementGap: 10955000,
          },
        },
      ],
      assignment: {
        status: "PENDING" as const,
        notes: "Highly qualified hot lead. Generated multiple calculator responses.",
      },
    },
    {
      fullName: "Sarah Connor",
      email: "sarah.connor@example.com",
      mobileNumber: "0916-333-4444",
      overallLeadScore: 65,
      leadCategory: "WARM" as const,
      profile: {
        age: 28,
        maritalStatus: "SINGLE" as const,
        dependentsCount: 1,
        monthlyIncomeRange: "₱50,000 - ₱100,000",
        currentSavings: "80000.00",
        retirementAgeGoal: 65,
      },
      responses: [
        {
          moduleType: "MILESTONE_SAVINGS" as const,
          inputs: {
            initialSavings: 80000,
            monthlyContribution: 8000,
            years: 10,
            expectedReturn: 7,
          },
          outputs: {
            projectedTotal: 1450000,
          },
        },
      ],
      assignment: {
        status: "CONTACTED" as const,
        notes: "Spoke via phone. Interested in child education savings plan.",
      },
    },
    {
      fullName: "Bruce Wayne",
      email: "bruce.wayne@waynecorp.com",
      mobileNumber: "0999-999-9999",
      overallLeadScore: 95,
      leadCategory: "HOT" as const,
      profile: {
        age: 35,
        maritalStatus: "SINGLE" as const,
        dependentsCount: 0,
        monthlyIncomeRange: "₱100,000+",
        currentSavings: "5000000.00",
        retirementAgeGoal: 55,
      },
      responses: [
        {
          moduleType: "MILESTONE_SAVINGS" as const,
          inputs: {
            initialSavings: 5000000,
            monthlyContribution: 50000,
            years: 10,
            expectedReturn: 9,
          },
          outputs: {
            projectedTotal: 25000000,
          },
        },
      ],
      assignment: {
        status: "CONVERTED" as const,
        notes: "Converted to premium wealth solution account. Scheduled regular review.",
      },
    },
    {
      fullName: "Peter Parker",
      email: "peter.parker@dailybugle.com",
      mobileNumber: "0921-222-3333",
      overallLeadScore: 25,
      leadCategory: "COLD" as const,
      profile: {
        age: 22,
        maritalStatus: "SINGLE" as const,
        dependentsCount: 0,
        monthlyIncomeRange: "Under ₱30,000",
        currentSavings: "500.00",
        retirementAgeGoal: 60,
      },
      responses: [
        {
          moduleType: "MILESTONE_SAVINGS" as const,
          inputs: {
            initialSavings: 500,
            monthlyContribution: 100,
            years: 5,
            expectedReturn: 5,
          },
          outputs: {
            projectedTotal: 7500,
          },
        },
      ],
      assignment: {
        status: "LOST" as const,
        notes: "Unable to reach user. Email bounced or was invalid.",
      },
    },
  ];

  console.log("Seeding leads, profiles, responses, and assignments...");
  for (const leadItem of mockLeads) {
    const existing = await db.select().from(leads).where(eq(leads.email, leadItem.email)).limit(1);
    let leadId: string;

    if (existing.length > 0) {
      leadId = existing[0].id;
      console.log(`Lead ${leadItem.fullName} already exists.`);
    } else {
      const insertedLeads = await db.insert(leads).values({
        fullName: leadItem.fullName,
        email: leadItem.email,
        mobileNumber: leadItem.mobileNumber,
        overallLeadScore: leadItem.overallLeadScore,
        leadCategory: leadItem.leadCategory,
      }).returning();
      leadId = insertedLeads[0].id;
      console.log(`Seeded lead: ${leadItem.fullName}`);

      // Insert Profile
      await db.insert(financialProfiles).values({
        leadId,
        ...leadItem.profile,
      });

      // Insert Responses
      for (const res of leadItem.responses) {
        await db.insert(fnaModulesResponses).values({
          leadId,
          ...res,
        });
      }

      // Assign to Advisor (round-robin/random)
      const advisor = activeAdvisors[Math.floor(Math.random() * activeAdvisors.length)];
      await db.insert(leadAssignments).values({
        leadId,
        advisorId: advisor ? advisor.id : null,
        status: leadItem.assignment.status,
        notes: leadItem.assignment.notes,
      });
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
