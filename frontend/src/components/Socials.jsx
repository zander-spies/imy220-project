function Socials({ socialLinks }) {
    return (
        <div className="mb-2">
            <h3>Social Links</h3>

            {socialLinks.length === 0 ? (
                <p>No social links added yet.</p>
            ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  {socialLinks.map((social, index) => (
                      <div key={index}>
                          <a
                              className="text-brand hover:underline"
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                          >
                              {social.platform}
                          </a>
                      </div>
                  ))}
              </div>
            )}
        </div>
    );
}

export default Socials;