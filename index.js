const { Client, GatewayIntentBits, Partials, ChannelType, PermissionsBitField } = require("discord.js");
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const prefix = "!";
const token = "MTEzMzQzMzM0NTY5MTM2MTM3MQ.GFjIsx.6kSpNz_ZJhZ0yZTL1fT9Wr1EJAR-vRBglfRTkY"; // Tokeninizi buraya koyun

client.once("ready", () => {
    console.log(`${client.user.tag} aktif!`);
});

client.on("messageCreate", async message => {
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "setup") {
        const choice = args[0];
        if (!["temel","gelismis","vampirik"].includes(choice)) {
            return message.channel.send("❌ Şablon seçimi hatalı. Kullanım: `!setup [temel|gelismis|vampirik]`");
        }

        const guild = message.guild;

        // 1️⃣ Mevcut kanalları ve rolleri sil
        message.channel.send("🧹 Eski roller ve kanallar siliniyor...");
        try {
            guild.channels.cache.forEach(async (c) => { try { await c.delete(); } catch(e){} });
            guild.roles.cache.filter(r => !r.managed && r.name !== "@everyone" && r.name !== "Kurucu").forEach(async (r) => { try { await r.delete(); } catch(e){} });
        } catch(e){ console.log(e); }

        // 2️⃣ Roller ve Renkleri (şablona göre)
        const rollerTemplates = {
            "temel": [
                {name:"Admin",color:"#ff0000",desc:"Sunucu sahibi ve üst düzey moderatörler."},
                {name:"Moderatör",color:"#ff9800",desc:"Mesaj silme, kullanıcı moderasyonu."},
                {name:"Çevirmen",color:"#2196f3",desc:"Çeviri kanallarında yazma."},
                {name:"Editör",color:"#4caf50",desc:"Çeviri düzeltmeleri."},
                {name:"Okuyucu",color:"#9e9e9e",desc:"Genel kanallarda okuma/yazma."},
                {name:"VIP",color:"#9c27b0",desc:"Özel kanallara erişim."},
                {name:"Bot",color:"#ffeb3b",desc:"Botlar için rol."}
            ],
            "gelismis": [
                {name:"Admin",color:"#e91e63",desc:"Tam yetki."},
                {name:"Moderatör",color:"#ff9800",desc:"Moderasyon görevleri."},
                {name:"Çevirmen",color:"#2196f3",desc:"Çeviri projeleri."},
                {name:"Editör",color:"#4caf50",desc:"Düzeltme ve inceleme."},
                {name:"Kalite Kontrol (QA)",color:"#ffb74d",desc:"Çeviri kalite kontrol."},
                {name:"Tasarımcı",color:"#9c27b0",desc:"Medya ve tasarım."},
                {name:"Okuyucu",color:"#9e9e9e",desc:"Genel erişim."},
                {name:"VIP",color:"#9c27b0",desc:"Teşekkür rolü."},
                {name:"Bot",color:"#ffeb3b",desc:"Botlar için."}
            ],
            "vampirik": [
                {name:"Kan Efendisi",color:"#4b0082",desc:"Admin, tam yetki."},
                {name:"Gölge Muhafız",color:"#800080",desc:"Moderatör."},
                {name:"Kan Çevirmeni",color:"#9370db",desc:"Çeviri yapabilir."},
                {name:"Gece Editörü",color:"#dda0dd",desc:"Editör rolü."},
                {name:"Gecenin İzleyicisi",color:"#9e9e9e",desc:"Varsayılan."},
                {name:"Ebedi VIP",color:"#8b0000",desc:"Özel üyeler."},
                {name:"Gölge Bot",color:"#000000",desc:"Botlar için."},
                {name:"Fısıltı Duyurucusu",color:"#9400d3",desc:"Duyurular."},
                {name:"Karanlık Tasarımcı",color:"#4b0082",desc:"Medya ve tasarım."},
                {name:"Kan Bağlı Katkı",color:"#800080",desc:"Aktif üyeler."}
            ]
        };

        message.channel.send("🎨 Roller oluşturuluyor...");
        for(const r of rollerTemplates[choice]){
            try { await guild.roles.create({name:r.name,color:r.color,reason:"Alice Scans Setup"}); } catch(e){console.log(e);}
        }

        // 3️⃣ Kategoriler ve Kanallar (şablona göre)
        const kanallarTemplates = {
            "temel": [
                {cat:"📢 Duyurular",channels:[
                    {name:"#duyurular",type:ChannelType.GuildText,desc:"Yeni manga duyuruları, etkinlikler"},
                    {name:"#güncellemeler",type:ChannelType.GuildText,desc:"Çeviri ilerlemeleri ve release'ler"}
                ]},
                {cat:"💬 Genel Sohbet",channels:[
                    {name:"#genel-sohbet",type:ChannelType.GuildText,desc:"Serbest muhabbet, manga önerileri"},
                    {name:"#off-topic",type:ChannelType.GuildText,desc:"Manga dışı konular"},
                    {name:"#spoiler-free",type:ChannelType.GuildText,desc:"Spoilersız tartışmalar"}
                ]},
                {cat:"📚 Çeviri İşleri",channels:[
                    {name:"#çeviri-istekleri",type:ChannelType.GuildText,desc:"Hangi mangayı çevirmek istiyorsunuz?"},
                    {name:"#çeviri-işler",type:ChannelType.GuildText,desc:"Aktif çeviri projeleri"},
                    {name:"#editörlük",type:ChannelType.GuildText,desc:"Çeviri düzeltmeleri ve feedback"},
                    {name:"#kaynak-paylaşım",type:ChannelType.GuildText,desc:"Raw manga linkleri, font önerileri"}
                ]},
                {cat:"🖼️ Medya ve Paylaşımlar",channels:[
                    {name:"#manga-tanıtım",type:ChannelType.GuildText,desc:"Yeni chapter'lar, fan art"},
                    {name:"#spoilers",type:ChannelType.GuildText,desc:"Spoiler dolu tartışmalar"},
                    {name:"#arşiv",type:ChannelType.GuildText,desc:"Tamamlanan çeviriler"}
                ]}
            ],
            "gelismis":[ /* İsterse burada gelismis şablon kanalları */ ],
            "vampirik":[ /* Vampirik şablon kanalları */ ]
        };

        message.channel.send("📂 Kanallar oluşturuluyor...");
        for(const k of kanallarTemplates[choice]){
            try{
                const category = await guild.channels.create({name:k.cat,type:ChannelType.GuildCategory});
                for(const c of k.channels){
                    const ch = await guild.channels.create({name:c.name,type:c.type,parent:category.id});
                    if(c.desc) await ch.setTopic(c.desc);
                }
            } catch(e){console.log(e);}
        }

        message.channel.send(`✅ Alice Scans setup tamamlandı! Şablon: ${choice}`);
    }
});

client.login(token);