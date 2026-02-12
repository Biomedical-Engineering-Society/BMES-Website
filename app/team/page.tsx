import ChatWidget from "../components/ChatWidget";
import TeamCard from "../components/TeamCard";

export default function TeamPage() {  
  return (
    <div className="min-h-screen">
      {/* INSTRUCTIONS FOR AYDIN */}
      {/* AYDIN: This is the Exec Team Gallery.
        1. Create a grid layout (3 columns).
        2. Add 'TeamCard' components for each exec (Image, Name, Role, LinkedIn link).
        3. Add a section for 'Past Execs' or 'Gallery' of event photos at the bottom.
      */}
      <div className="w-full h-[calc(100vh-60px)] bg-white grid grid-cols-2 shadow-[inset_0_0_15px_rgba(0,0,0,0.15)]">
        <div className="h-full flex flex-col items-center justify-center bg-[var(--bmes-red)] shadow-[inset_0_0_15px_rgba(0,0,0,0.15)]">
          <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">Meet our Team</h1>
          <p className="text-md sm:text-md md:text-lg lg:text-xl font-semibold text-gray-300 mt-2 mx-10 text-center">Connecting students across campus with a passion for biomedical engineering!</p>
        </div>
        <div className="h-full flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.15)]"> 
          <div className="animate-[scalePulse_2.5s_ease-in-out_infinite]">
            <img src="/web-images/bmes-linkedin-icon.png" alt="BMES Linkedin Logo" />
          </div>
        </div>
      </div>
      
      <div className="p-10 shadow-[inset_0_0_15px_rgba(0,0,0,0.15)] bg-white">
        
        {/* Leaders */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">Leaders</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Mark Yacoub" image="default.jpg" role="President" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Ryson Yau" image="default.jpg" role="Vice President" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Afrah Khan" image="default.jpg" role="Advisor" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Sachit Thakur" image="default.jpg" role="Advisor" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Alfonso Santiago" image="default.jpg" role="Vice President of Marketing" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Blair Gao" image="default.jpg" role="Vice President of Events" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="David Faltaous" image="default.jpg" role="Vice President of Events" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Ricky Nong" image="default.jpg" role="Vice President of Finance" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Uma Sivaperuman" image="default.jpg" role="Vice President of Communications" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Yang Lu" image="default.jpg" role="Vice President of Operations" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        {/* Communications */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">Communications</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Kavin Manivannan" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Lior Monroy" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Mirna Zogheib" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Ronit Royan" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Shadid Tabeeb" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Varen Rajoo" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Vladimir Avila" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Wayne Thayaparan" image="default.jpg" role="Communications Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        {/* Events */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">Events</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Astar Alia Al Akkadi" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Divya Prajapati" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Leonardo Lopez-Papic" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Lydia Aziz" image="Lydia Aziz.jpeg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Manija Said Dawod" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Muhammad Taha" image="Muhammad Taha.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Narendra Persaud" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Pranjal Patel" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Rameesha Khan" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Rhea Braich" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Zina Abdalhk" image="default.jpg" role="Events Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        {/* Finance */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">Finance</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Ciara Roberts" image="default.jpg" role="Finance Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Joanne Ly" image="Joanne Ly.jpg" role="Finance Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        {/* Marketing */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">Marketing</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Abdullah Alsibai" image="default.jpg" role="Marketing Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Avrilmari Sacramento" image="default.jpg" role="Marketing Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Deyonta Fletcher" image="default.jpg" role="Marketing Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Dhwanil Rana" image="default.jpg" role="Marketing Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Gwen Titus" image="default.jpg" role="Marketing Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Nafiseh Rezagholi" image="default.jpg" role="Marketing Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Noemi Gaitan-Ruiz" image="default.jpg" role="Marketing Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        {/* Operations */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">Operations</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Anthony Ma" image="default.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Hanady Zbib" image="default.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Hasan Obaid" image="Hasan Obaid.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Jazib Shaoor" image="default.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Rachna Patel" image="default.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Ruhab Baig" image="default.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Sarah Morelli" image="default.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Theepiga Jegatheesh" image="default.jpg" role="Operations Director" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        {/* Website Developers */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">Website Developers</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Aydin Ghanbari" image="default.jpg" role="Website Developer" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Haris Siddiqui" image="default.jpg" role="Website Developer" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Hassan Laliwala" image="default.jpg" role="Website Developer" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Nithieshan Jeyaganeshan" image="default.jpg" role="Website Developer" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Samin Maharjan" image="default.jpg" role="Website Developer" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        {/* First Year Representatives */}
        <div className="max-w-6xl mx-auto shadow-[0_0_5px_rgba(0,0,0,0.2)]">
          <div className="max-w-6xl h-[75px] mx-auto bg-white p-3 rounded-[4px_4px_0_0]">
            <h2 className="text-3xl font-bold text-black text-center mx-auto w-[75%] border-b-2 p-2">First Year Representatives</h2>
          </div>
          <div className="max-w-6xl h-auto mx-auto bg-white mb-12 p-4 pb-9 rounded-[0_0_4px_4px] grid grid-cols-1 gap-3 gap-y-9 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 team-grid">
            <TeamCard name="Cezmhar Sibal" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Kaylin Dhanpaul" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Kelsi Sumaway" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Manasseh Mathiyas" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Raghangi Gunaseelan" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Shanath Sutharshan" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Shayan Shahbaz" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Sneha Chaudhary" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
            <TeamCard name="Vithuja Vigneswaran" image="default.jpg" role="First Year Representative" bio="This is the member's self-description. It will appear as the card expands."></TeamCard>
          </div>
        </div>

        <ChatWidget/>
      </div>
    </div>
  );
}
