from crewai import Agent, Task, Crew, LLM

llm = LLM(
    model="ollama/llama3.1",
    base_url="http://localhost:11434",
    temperature=0.3,
)

agent = Agent(
    role="Analista geopolitico",
    goal="Spiegare eventi geopolitici in modo chiaro",
    backstory="Analista esperto di politica internazionale",
    llm=llm,
    verbose=True,
)

task = Task(
    description="Spiega in modo semplice cosa sta succedendo oggi in Medio Oriente",
    expected_output="Un paragrafo chiaro e comprensibile",
    agent=agent,
)

crew = Crew(
    agents=[agent],
    tasks=[task],
    verbose=True,
)

result = crew.kickoff()
print("\nRISULTATO:\n", result)
