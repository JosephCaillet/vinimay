require 'open3'

puts 'Building'

`rm -rf build/server`
puts `tsc -p server`

if $?.exitstatus > 0
	puts "Build failed"
	exit false
end

$users = [ "alice", "bob", "frank" ]
$error = false

def run_tests(tests)
	tests.each do |t|
		puts "Running tests for #{t}"
		puts `newman run tests/#{t}.json`
		$error = $?.exitstatus > 0
	end
end

def run_servers(tests)
	ths = []
	started = []
	$users.each do |user|
		ths << Thread.new do
			Open3.popen3("npm run start:#{user}") do |stdin, stdout, stderr, thread|
				puts "Starting server for #{user} with PID #{thread.pid}"
				while line=stdout.gets do
					if line =~ /Server running at/
						started << thread.pid;
						puts "#{started.length}/#{$users.length} servers started"
						if started.length == $users.length
							puts "All servers running!"
							run_tests(tests)
							ths.each do |thr|
								puts "Killing process #{thr.pid}"
								thr.kill
							end
						end
					end
				end
			end
		end
	end

	ths.each { |thr| thr.join }
end

puts `./resetdb.sh #{$users.join(" ")} --test`

run_servers([ "me", "posts", "comments", "reactions" ])

puts `Resetting databases...`

puts `./resetdb.sh #{$users.join(" ")}`

run_servers([ "friends" ])

exit !$error
