import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const testDonors = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    password: "password123",
    bloodGroup: "O+",
    city: "New York",
    phone: "1234567890",
    isDonor: true,
    role: "donor"
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    password: "password123",
    bloodGroup: "A-",
    city: "Los Angeles",
    phone: "1234567891",
    isDonor: true,
    role: "donor"
  },
  {
    name: "Michael Brown",
    email: "michael.b@example.com",
    password: "password123",
    bloodGroup: "B+",
    city: "Chicago",
    phone: "1234567892",
    isDonor: true,
    role: "donor"
  },
  {
    name: "Emily Davis",
    email: "emily.d@example.com",
    password: "password123",
    bloodGroup: "AB+",
    city: "Houston",
    phone: "1234567893",
    isDonor: true,
    role: "donor"
  },
  {
    name: "David Wilson",
    email: "david.w@example.com",
    password: "password123",
    bloodGroup: "O-",
    city: "Miami",
    phone: "1234567894",
    isDonor: true,
    role: "donor"
  },
  {
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    password: "password123",
    bloodGroup: "A+",
    city: "Seattle",
    phone: "1234567895",
    isDonor: true,
    role: "donor"
  },
  {
    name: "Robert Taylor",
    email: "robert.t@example.com",
    password: "password123",
    bloodGroup: "B-",
    city: "Boston",
    phone: "1234567896",
    isDonor: true,
    role: "donor"
  },
  {
    name: "Jessica Martinez",
    email: "jessica.m@example.com",
    password: "password123",
    bloodGroup: "AB-",
    city: "San Francisco",
    phone: "1234567897",
    isDonor: true,
    role: "donor"
  }
];

const seedDonors = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const saltRounds = 10;
    let created = 0;
    let skipped = 0;

    for (const donorData of testDonors) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: donorData.email });
      
      if (existingUser) {
        // Update existing user to be a donor if not already
        if (!existingUser.isDonor) {
          existingUser.isDonor = true;
          existingUser.bloodGroup = donorData.bloodGroup;
          existingUser.city = donorData.city;
          existingUser.phone = donorData.phone;
          await existingUser.save();
          console.log(`✅ Updated existing user to donor: ${donorData.name}`);
          created++;
        } else {
          console.log(`⏭️  User already exists as donor: ${donorData.name}`);
          skipped++;
        }
      } else {
        // Create new donor
        const hashedPassword = await bcrypt.hash(donorData.password, saltRounds);
        const donor = new User({
          ...donorData,
          password: hashedPassword
        });
        await donor.save();
        console.log(`✅ Created donor: ${donorData.name}`);
        created++;
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`Created/Updated: ${created} donors`);
    console.log(`Skipped: ${skipped} donors`);
    
    // Count total donors
    const totalDonors = await User.countDocuments({ isDonor: true });
    console.log(`Total donors in database: ${totalDonors}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding donors:", error);
    process.exit(1);
  }
};

seedDonors();




