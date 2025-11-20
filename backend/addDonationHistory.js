import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

// Add sample donation history to test donors
const addDonationHistory = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Get all donors
    const donors = await User.find({ isDonor: true });
    console.log(`Found ${donors.length} donors`);

    // Sample donation history data
    const sampleDonations = [
      {
        date: new Date('2024-01-15'),
        location: 'City Hospital',
        bloodGroup: 'O+',
        quantity: 450,
        certificateId: 'CERT-001'
      },
      {
        date: new Date('2024-03-20'),
        location: 'General Hospital',
        bloodGroup: 'O+',
        quantity: 450,
        certificateId: 'CERT-002'
      },
      {
        date: new Date('2024-06-10'),
        location: 'Memorial Hospital',
        bloodGroup: 'O+',
        quantity: 450,
        certificateId: 'CERT-003'
      },
      {
        date: new Date('2024-09-05'),
        location: 'Community Hospital',
        bloodGroup: 'O+',
        quantity: 450,
        certificateId: 'CERT-004'
      },
      {
        date: new Date('2024-11-01'),
        location: 'Central Hospital',
        bloodGroup: 'O+',
        quantity: 450,
        certificateId: 'CERT-005'
      }
    ];

    let updated = 0;

    for (const donor of donors) {
      // Skip if donor already has donation history
      if (donor.donationHistory && donor.donationHistory.length > 0) {
        console.log(`⏭️  ${donor.name} already has ${donor.donationHistory.length} donations`);
        continue;
      }

      // Assign different number of donations based on donor index
      const donationCount = Math.floor(Math.random() * 5) + 1; // 1-5 donations
      const donations = sampleDonations.slice(0, donationCount).map(donation => ({
        ...donation,
        bloodGroup: donor.bloodGroup || donation.bloodGroup,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date in last year
      }));

      // Add donation history
      donor.donationHistory = donations;
      await donor.save();
      
      console.log(`✅ Added ${donationCount} donations to ${donor.name}`);
      updated++;
    }

    console.log(`\n✅ Updated ${updated} donors with donation history`);
    
    // Show leaderboard summary
    const allDonors = await User.find({ isDonor: true }).select('name donationHistory');
    console.log(`\n📊 Leaderboard Summary:`);
    allDonors
      .map(d => ({
        name: d.name,
        donations: d.donationHistory ? d.donationHistory.length : 0
      }))
      .sort((a, b) => b.donations - a.donations)
      .slice(0, 10)
      .forEach((d, i) => {
        console.log(`${i + 1}. ${d.name}: ${d.donations} donations`);
      });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding donation history:", error);
    process.exit(1);
  }
};

addDonationHistory();




